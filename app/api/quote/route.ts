import { NextResponse, type NextRequest } from "next/server";

import { getAdminClient, getStorageClient } from "@/lib/supabase/server";
import {
  DOCUMENT_TYPES,
  LIMITS,
  PHOTO_TYPES,
  QUOTE_BUCKET,
  QUOTE_SOURCES,
  clean,
  makeReference,
  quoteStoragePath,
  validateContact,
  validateQuote,
  type ContactFormValues,
  type QuoteFormValues,
  type QuoteProjectType,
  type QuoteSource,
} from "@/lib/quote";

export const dynamic = "force-dynamic";

/**
 * Public endpoint for the quote form.
 *
 * The browser never talks to Supabase directly for this: the anon key has no
 * INSERT policy on `contact_requests` (see supabase/schema.sql), so the request
 * comes here instead. That is what lets us validate, rate limit, strip honeypot
 * spam and refuse oversized uploads before anything is written.
 *
 * The service_role key is used server-side only. When it is missing we answer
 * 503 with code "not_configured" so the form can offer WhatsApp or email instead
 * of pretending an enquiry was saved.
 */

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

/**
 * Best-effort per-IP throttle. In-memory on purpose: it needs no extra service
 * and it dies with the instance. On serverless this resets on a cold start and
 * is per-region, so treat it as a speed bump against casual form spam, not as the
 * thing that keeps the database safe -- the field caps and RLS are that.
 */
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (now - times[times.length - 1] > RATE_LIMIT_WINDOW_MS) hits.delete(key);
    }
  }

  return false;
}

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function fail(message: string, status = 400, code?: string) {
  return NextResponse.json({ error: message, code }, { status });
}

const asProjectType = (v: string): QuoteProjectType =>
  v === "residential" || v === "commercial" ? v : "other";

const asSource = (v: string): QuoteSource =>
  (QUOTE_SOURCES as readonly string[]).includes(v)
    ? (v as QuoteSource)
    : "quote";

/** Accepts either a browser multipart post or a plain JSON body. */
async function readInput(
  req: NextRequest,
): Promise<{ fields: Record<string, string>; files: File[] }> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const fields: Record<string, string> = {};
    const files: File[] = [];

    for (const [key, value] of form.entries()) {
      if (value instanceof File) {
        if (value.size > 0) files.push(value);
      } else if (typeof value === "string") {
        fields[key] = value;
      }
    }

    return { fields, files };
  }

  const body = await req.json().catch(() => ({}));
  return {
    fields: body && typeof body === "object" ? (body as Record<string, string>) : {},
    files: [],
  };
}

function partitionFiles(files: File[]) {
  const photos: File[] = [];
  const documents: File[] = [];
  const rejected: string[] = [];

  for (const file of files) {
    const type = file.type.toLowerCase();

    if (type.startsWith("image/")) {
      if (!(PHOTO_TYPES as readonly string[]).includes(type)) {
        rejected.push(`${file.name}: unsupported image type`);
        continue;
      }
      photos.push(file);
      continue;
    }

    if (!(DOCUMENT_TYPES as readonly string[]).includes(type)) {
      rejected.push(`${file.name}: unsupported file type`);
      continue;
    }
    documents.push(file);
  }

  return { photos, documents, rejected };
}

export async function POST(req: NextRequest) {
  if (rateLimited(clientIp(req))) {
    return fail(
      "Too many requests. Please try again later or contact us directly.",
      429,
      "rate_limited",
    );
  }

  let fields: Record<string, string>;
  let files: File[];

  try {
    ({ fields, files } = await readInput(req));
  } catch {
    return fail("Could not read the submitted form.");
  }

  // Honeypot: a hidden field only a bot fills in. Answer as if it worked so the
  // bot does not learn to retry, and store nothing.
  if (clean(fields.website, 200)) {
    return NextResponse.json({ ok: true, reference: makeReference() }, { status: 201 });
  }

  const source = asSource(clean(fields.source, 20));
  const locale = clean(fields.locale, 8) || "en";

  const fieldError = (errors: Record<string, string>) =>
    NextResponse.json(
      { error: "Please check the highlighted fields.", fields: errors },
      { status: 422 },
    );

  // Two shapes arrive at one endpoint: the full quote request and the short
  // contact message. They share every downstream step, so they differ only in
  // how strictly they are validated and which columns they fill.
  let row: Record<string, unknown>;

  if (source === "contact") {
    const parsed = validateContact(fields as Partial<ContactFormValues>);
    if (!parsed.ok) return fieldError(parsed.errors);
    row = {
      name: parsed.values.name,
      phone: null,
      email: parsed.values.email,
      subject: parsed.values.subject,
      location: null,
      project_type: "other",
      service: null,
      area: null,
      budget: null,
      preferred_date: null,
      description: parsed.values.message,
    };
  } else {
    const parsed = validateQuote(fields as Partial<QuoteFormValues>);
    if (!parsed.ok) return fieldError(parsed.errors);
    row = {
      name: parsed.values.name,
      phone: parsed.values.phone,
      email: parsed.values.email,
      subject: null,
      location: parsed.values.location,
      project_type: asProjectType(parsed.values.projectType),
      service: parsed.values.service,
      area: parsed.values.area || null,
      budget: parsed.values.budget || null,
      preferred_date: parsed.values.preferredDate || null,
      description: parsed.values.description,
    };
  }

  if (files.length > LIMITS.files) {
    return fail(`Please attach at most ${LIMITS.files} files.`, 413, "too_many_files");
  }

  const { photos, documents, rejected } = partitionFiles(files);

  const oversize = [...photos, ...documents].find((f) => f.size > LIMITS.fileBytes);
  if (oversize) {
    return fail(
      `${oversize.name} is larger than ${LIMITS.fileBytes / 1024 / 1024} MB.`,
      413,
      "file_too_large",
    );
  }

  const total = [...photos, ...documents].reduce((sum, f) => sum + f.size, 0);
  if (total > LIMITS.totalBytes) {
    return fail("The attachments are too large in total.", 413, "too_many_files");
  }

  const db = getAdminClient();
  if (!db) {
    // Nothing was stored, so say so plainly and let the browser fall back to
    // WhatsApp. Pretending success here would lose real enquiries.
    return fail(
      "Enquiries cannot be saved on this deployment.",
      503,
      "not_configured",
    );
  }

  const warnings = rejected.length
    ? [`Some files were skipped: ${rejected.join("; ")}`]
    : [];

  // Insert first: if the row is in, the enquiry is safe even if an attachment
  // fails, and the owner can still be told what was missing.
  const reference = makeReference();
  Object.assign(row, {
    id: crypto.randomUUID(),
    reference,
    photos: [] as string[],
    documents: [] as string[],
    locale,
    source,
    status: "new",
  });

  const { error: insertError } = await db.from("contact_requests").insert(row as never);

  if (insertError) {
    // A duplicate reference is the only realistic collision here; retrying once
    // costs nothing and avoids failing a real customer over a 1-in-24-million
    // random code.
    if (insertError.code === "23505") {
      const retry = { ...row, reference: makeReference() };
      const { error: retryError } = await db
        .from("contact_requests")
        .insert(retry as never);
      if (retryError) {
        return fail(`Could not save your request: ${retryError.message}`, 500);
      }
      return storeAttachments(retry.reference, photos, documents, warnings);
    }
    return fail(`Could not save your request: ${insertError.message}`, 500);
  }

  return storeAttachments(reference, photos, documents, warnings);
}

/**
 * Uploads the attachments into the private bucket, then patches the paths onto
 * the request row. Uploads are best effort on purpose: the text of the enquiry
 * matters more than the photos, so a storage failure must not lose the request.
 */
async function storeAttachments(
  reference: string,
  photos: File[],
  documents: File[],
  warnings: string[] = [],
) {
  const uploadErrors: string[] = [...warnings];
  const photoPaths: string[] = [];
  const documentPaths: string[] = [];

  const storage = getStorageClient();
  const db = getAdminClient();

  if ((photos.length || documents.length) && !storage) {
    return NextResponse.json(
      {
        ok: true,
        reference,
        warnings: [
          ...warnings,
          "Attachments could not be stored because storage is not configured.",
        ],
      },
      { status: 201 },
    );
  }

  if (storage) {
    const upload = async (list: File[], folder: "photos" | "documents") => {
      for (const file of list) {
        const path = quoteStoragePath(reference, folder, file.name);
        const { error } = await storage.storage
          .from(QUOTE_BUCKET)
          .upload(path, Buffer.from(await file.arrayBuffer()), {
            contentType: file.type,
            cacheControl: "3600",
            upsert: true,
          });
        if (error) uploadErrors.push(`${file.name}: ${error.message}`);
        else if (folder === "photos") photoPaths.push(path);
        else documentPaths.push(path);
      }
    };

    await upload(photos, "photos");
    await upload(documents, "documents");
  }

  if (db && (photoPaths.length || documentPaths.length)) {
    const { error } = await db
      .from("contact_requests")
      .update({
        photos: photoPaths,
        documents: documentPaths,
      } as never)
      .eq("reference", reference);

    if (error) {
      uploadErrors.push(`Attachment list not saved: ${error.message}`);
    }
  }

  return NextResponse.json(
    { ok: true, reference, warnings: uploadErrors.length ? uploadErrors : undefined },
    { status: 201 },
  );
}
