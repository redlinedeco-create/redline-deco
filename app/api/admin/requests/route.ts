import { NextResponse, type NextRequest } from "next/server";

import { fail, requireAdmin } from "@/lib/admin/guards";
import { getAdminClient } from "@/lib/supabase/server";
import {
  LIMITS,
  QUOTE_BUCKET,
  REQUEST_STATUSES,
  cleanText,
  type QuoteStatus,
} from "@/lib/quote";

export const dynamic = "force-dynamic";

/**
 * The enquiry inbox behind the admin dashboard's Requests tab.
 *
 * Reads and writes customer data, so it is behind the same two checks as every
 * other admin route: a live Supabase session plus the service_role key.
 *
 * Attachments live in a private bucket. They are never returned as paths the
 * browser could turn into a public URL -- each one gets a short-lived signed
 * URL instead, so a link that leaks in a screenshot stops working.
 */

/** Long enough to click through a gallery, short enough to not be a permalink. */
const SIGNED_URL_TTL_SECONDS = 60 * 60;

const isStatus = (value: string): value is QuoteStatus =>
  (REQUEST_STATUSES as readonly string[]).includes(value);

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((x): x is string => typeof x === "string" && x.length > 0)
    : [];
}

/**
 * Signs every attachment on one request. Runs in parallel because a single
 * request can carry up to eight files and each round trip is latency the owner
 * is waiting through.
 */
async function withSignedUrls(
  db: NonNullable<ReturnType<typeof getAdminClient>>,
  row: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const paths = [...asStringArray(row.photos), ...asStringArray(row.documents)];
  if (paths.length === 0) return row;

  const { data } = await db.storage
    .from(QUOTE_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  const signed = new Map<string, string>();
  for (const entry of data ?? []) {
    const p = entry.path;
    if (p && entry.signedUrl) signed.set(p, entry.signedUrl);
  }

  const sign = (path: string) => ({
    path,
    name: path.split("/").pop() ?? path,
    url: signed.get(path) ?? null,
  });

  return {
    ...row,
    photos: asStringArray(row.photos).map(sign),
    documents: asStringArray(row.documents).map(sign),
  };
}

/** GET /api/admin/requests -- newest first, optionally filtered by status. */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const status = req.nextUrl.searchParams.get("status");

  let query = guard.db
    .from("contact_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && status !== "all") {
    if (!isStatus(status)) return fail(`Unknown status "${status}".`);
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return fail(`Could not read requests: ${error.message}`, 500);

  const rows = (data ?? []) as Record<string, unknown>[];
  const requests = await Promise.all(rows.map((row) => withSignedUrls(guard.db, row)));

  // One extra count for the tab badge, so the dashboard can show how many are
  // unanswered without counting the filtered page.
  const { count } = await guard.db
    .from("contact_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return NextResponse.json({ requests, newCount: count ?? 0 });
}

/** PATCH /api/admin/requests -- change the status and/or the private note. */
export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Expected a JSON body.");

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) return fail("Missing id.");

  const values: Record<string, unknown> = {};

  if ("status" in body) {
    const status = typeof body.status === "string" ? body.status : "";
    if (!isStatus(status)) {
      return fail(`Status must be one of: ${REQUEST_STATUSES.join(", ")}.`);
    }
    values.status = status;
  }

  if ("admin_note" in body) {
    const note = cleanText(body.admin_note, LIMITS.note);
    values.admin_note = note.length ? note : null;
  }

  if (Object.keys(values).length === 0) {
    return fail("Nothing to update.");
  }

  const { data, error } = await guard.db
    .from("contact_requests")
    .update(values as never)
    .eq("id", id)
    .select()
    .single();

  if (error) return fail(`Could not update the request: ${error.message}`, 500);

  return NextResponse.json({ request: data });
}

/** DELETE /api/admin/requests?id=... -- also removes the customer's files. */
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const id = req.nextUrl.searchParams.get("id")?.trim();
  if (!id) return fail("Missing id.");

  const { data: row, error: readError } = await guard.db
    .from("contact_requests")
    .select("photos, documents")
    .eq("id", id)
    .single();

  if (readError) {
    return fail(`Could not read the request: ${readError.message}`, 500);
  }

  const { error } = await guard.db.from("contact_requests").delete().eq("id", id);
  if (error) return fail(`Could not delete the request: ${error.message}`, 500);

  // The row is gone; the files are the customer's data and should go with it.
  const paths = [...asStringArray(row?.photos), ...asStringArray(row?.documents)];
  let warning: string | undefined;

  if (paths.length) {
    const { error: storageError } = await guard.db.storage
      .from(QUOTE_BUCKET)
      .remove(paths);
    if (storageError) {
      warning = `The request was deleted but its files could not be: ${storageError.message}`;
    }
  }

  return NextResponse.json({ ok: true, warning });
}
