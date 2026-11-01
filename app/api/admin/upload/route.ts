import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { revalidateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { MEDIA_BUCKET, getAdminClient } from "@/lib/supabase/server";
import { fail, requireStorage } from "@/lib/admin/guards";

export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024;

const MIME: Record<string, string> = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
  "image/avif": "image/avif",
  "image/gif": "image/gif",
};

/** Strips anything that could escape the folder or confuse a filesystem. */
function safeSegment(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .toLowerCase();
}

function safeFolder(folder: string): string {
  return safeSegment(folder) || "general";
}

/**
 * Finds a free path so an upload can never silently overwrite an existing
 * photo -- overwriting would break any project already referencing it.
 */
async function uniquePath(
  db: SupabaseClient,
  folder: string,
  filename: string,
): Promise<string> {
  const dot = filename.lastIndexOf(".");
  const stem = dot > 0 ? filename.slice(0, dot) : filename;
  const ext = dot > 0 ? filename.slice(dot) : "";

  const candidate = `${folder}/${stem}${ext}`;
  const { data } = await db.storage.from(MEDIA_BUCKET).list(folder, { search: stem });
  const taken = new Set(
    (data ?? []).map((o: { name: string }) => o.name.toLowerCase()),
  );

  if (!taken.has(`${stem}${ext}`.toLowerCase())) return candidate;

  for (let i = 2; i < 200; i++) {
    const next = `${folder}/${stem}-${i}${ext}`;
    if (!taken.has(`${stem}-${i}${ext}`.toLowerCase())) return next;
  }
  return `${folder}/${stem}-${randomUUID().slice(0, 8)}${ext}`;
}

/**
 * The storage-scoped secret can only reach the Storage API, so anything that
 * reads the media table needs the full service_role client. Returns null when
 * that key is absent.
 */
function tableClient() {
  return getAdminClient();
}

/** GET /api/admin/upload -- the media library, newest first. */
export async function GET(req: NextRequest) {
  const guard = await requireStorage();
  if (guard.error) return guard.error;

  const table = tableClient();
  if (!table) {
    return fail(
      "SUPABASE_SERVICE_ROLE_KEY is not set, so the media library cannot be listed.",
      503,
    );
  }

  const folder = req.nextUrl.searchParams.get("folder");

  let query = table.from("media").select("*").order("created_at", { ascending: false });
  if (folder) query = query.eq("folder", folder);

  const { data, error } = await query.limit(500);
  if (error) return fail(`Could not read the media library: ${error.message}`, 500);

  return NextResponse.json({ media: data ?? [] });
}

/** POST /api/admin/upload -- multipart upload into the public media bucket. */
export async function POST(req: NextRequest) {
  const guard = await requireStorage();
  if (guard.error) return guard.error;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Expected a multipart form upload.");
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return fail("No files were uploaded.");

  const folder = safeFolder(String(form.get("folder") ?? "general"));
  const uploaded: Record<string, unknown>[] = [];
  const errors: string[] = [];

  // The file itself goes to storage with the storage-scoped secret. Recording
  // it in the media table needs the full service_role, so that part is skipped
  // rather than failing the upload when only the storage key is configured.
  const table = tableClient();
  if (!table) {
    errors.push(
      "SUPABASE_SERVICE_ROLE_KEY is not set, so these files were uploaded but not added to the media library.",
    );
  }

  for (const file of files) {
    if (!MIME[file.type]) {
      errors.push(`${file.name}: unsupported type ${file.type || "unknown"}`);
      continue;
    }
    if (file.size > MAX_BYTES) {
      errors.push(`${file.name}: larger than ${MAX_BYTES / 1024 / 1024} MB`);
      continue;
    }

    const filename = safeSegment(file.name);
    if (!filename) {
      errors.push(`${file.name}: unusable filename`);
      continue;
    }

    const path = await uniquePath(guard.db, folder, filename);
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await guard.db.storage
      .from(MEDIA_BUCKET)
      .upload(path, bytes, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (upErr) {
      errors.push(`${file.name}: ${upErr.message}`);
      continue;
    }

    if (!table) {
      uploaded.push({ path, filename, mime: file.type, size_bytes: file.size, folder });
      continue;
    }

    const { data: row, error: rowErr } = await table
      .from("media")
      .insert({
        path,
        filename,
        mime: file.type,
        size_bytes: file.size,
        folder,
      } as never)
      .select()
      .single();

    if (rowErr) {
      // Keep the object but say so, rather than leaving an orphan in storage.
      errors.push(`${file.name}: uploaded but could not be recorded (${rowErr.message})`);
      continue;
    }
    uploaded.push(row);
  }

  if (uploaded.length === 0) {
    return fail(errors.join("; ") || "Nothing could be uploaded.", 400);
  }

  revalidateTag("content");
  return NextResponse.json({ media: uploaded, errors }, { status: 201 });
}

/** DELETE /api/admin/upload?path=painting/painting-01.jpg */
export async function DELETE(req: NextRequest) {
  const guard = await requireStorage();
  if (guard.error) return guard.error;

  const path = req.nextUrl.searchParams.get("path")?.trim();
  if (!path) return fail("Missing path.");

  const { error } = await guard.db.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) return fail(`Could not delete the file: ${error.message}`, 500);

  // The row is secondary: the file is the thing the owner asked to remove. With
  // only the storage key configured the row has to stay.
  const table = tableClient();
  if (!table) {
    return NextResponse.json(
      {
        ok: true,
        warning:
          "File deleted, but its library entry remains because SUPABASE_SERVICE_ROLE_KEY is not set.",
      },
      { status: 200 },
    );
  }

  const { error: rowErr } = await table.from("media").delete().eq("path", path);
  if (rowErr) {
    return NextResponse.json(
      { ok: true, warning: `File deleted but its library entry remains: ${rowErr.message}` },
      { status: 200 },
    );
  }

  revalidateTag("content");
  return NextResponse.json({ ok: true });
}