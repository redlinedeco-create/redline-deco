import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { fail, newId, requireAdmin } from "./guards";

type SanitizeResult =
  | { ok: true; values: Record<string, unknown> }
  | { ok: false; error: string; status?: number };

export interface CrudConfig {
  table: string;
  /** Prefix for generated primary keys, e.g. "p" -> "p3f9a2c1b0d". */
  idPrefix: string;
  /** Human-readable name used in error messages. */
  label: string;
  /**
   * Turns a request body into column values. Called with partial=true for
   * PATCH so an absent key stays absent instead of being nulled out.
   */
  sanitize: (body: Record<string, unknown>, partial: boolean) => SanitizeResult;
  /**
   * Optional pre-delete hook. Return an error string to refuse the delete --
   * used to stop a category being removed while projects still point at it.
   */
  checkDelete?: (db: SupabaseClient, id: string) => Promise<string | null>;
  /**
   * Set for tables that have a `sort_order` column. New rows are appended
   * after the existing ones instead of all landing on the default 0.
   */
  sortable?: boolean;
  /**
   * For tables whose primary key is a natural key (`site_text`, `settings`)
   * instead of an `id` column. Rows are then addressed by that column: the
   * client sends it as `id`, and inserts/upserts never invent an id.
   */
  keyColumn?: string;
}

/**
 * Every page that renders this content. `revalidateTag` alone only busts the
 * data cache -- the prerendered ISR pages keep serving the old HTML for up to
 * `revalidate` seconds, so an admin edit looks like it was ignored. Paths are
 * revalidated too, making the change visible on the next request.
 */
const AFFECTED_PATHS = ["/", "/portfolio", "/prices", "/services", "/admin"];

function revalidateSite() {
  revalidateTag("content");
  for (const path of AFFECTED_PATHS) revalidatePath(path);
}

/** Highest sort_order currently in the table, or 0 when it is empty. */
async function nextSortOrder(db: SupabaseClient, table: string): Promise<number> {
  try {
    const { data } = await db
      .from(table)
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const max = Number((data as { sort_order?: unknown } | null)?.sort_order);
    return Number.isFinite(max) ? max + 1 : 0;
  } catch {
    return 0;
  }
}

/**
 * Builds the POST/PATCH/DELETE handlers for one table. Every request re-checks
 * the session, so revoking admin access takes effect immediately rather than
 * waiting for a page refresh.
 */
export function buildCrudHandlers(cfg: CrudConfig) {
  const { table, idPrefix, label, sanitize, checkDelete } = cfg;

  /** The value that identifies a row: the generated id, or the natural key. */
  function identity(body: Record<string, unknown>): string | null {
    if (cfg.keyColumn) {
      if (typeof body.id === "string" && body.id.trim()) return body.id.trim();
      const natural = body[cfg.keyColumn];
      return typeof natural === "string" && natural.trim()
        ? natural.trim()
        : null;
    }
    const id = typeof body.id === "string" ? body.id.trim() : "";
    return id || null;
  }

  async function readBody(req: NextRequest): Promise<Record<string, unknown>> {
    try {
      const body = await req.json();
      return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }

  async function POST(req: NextRequest) {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const body = await readBody(req);
    const parsed = sanitize(body, false);
    if (!parsed.ok) return fail(parsed.error, parsed.status ?? 400);

    const row: Record<string, unknown> = cfg.keyColumn
      ? { ...parsed.values }
      : { id: newId(idPrefix), ...parsed.values };
    if (cfg.sortable && !("sort_order" in row)) {
      row.sort_order = await nextSortOrder(guard.db, table);
    }

    const { data, error } = await guard.db
      .from(table)
      .insert(row as never)
      .select()
      .single();

    if (error) return fail(`Could not create ${label}: ${error.message}`, 500);
    revalidateSite();
    return NextResponse.json({ [label]: data }, { status: 201 });
  }

  async function PATCH(req: NextRequest) {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const body = await readBody(req);
    const id = identity(body);
    if (!id) return fail("Missing id.");

    const parsed = sanitize(body, true);
    if (!parsed.ok) return fail(parsed.error, parsed.status ?? 400);

    // An update that changes nothing would still bump updated_at; allow the
    // toggle-style calls that only send featured.
    const { data, error } = await guard.db
      .from(table)
      .update({ ...parsed.values, updated_at: new Date().toISOString() } as never)
      .eq(cfg.keyColumn ?? "id", id)
      .select()
      .single();

    if (error) return fail(`Could not update ${label}: ${error.message}`, 500);
    revalidateSite();
    return NextResponse.json({ [label]: data });
  }

  async function DELETE(req: NextRequest) {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const id = req.nextUrl.searchParams.get("id")?.trim();
    if (!id) return fail("Missing id.");

    if (checkDelete) {
      const problem = await checkDelete(guard.db, id);
      if (problem) return fail(problem, 409);
    }

    const { error } = await guard.db
      .from(table)
      .delete()
      .eq(cfg.keyColumn ?? "id", id);
    if (error) return fail(`Could not delete ${label}: ${error.message}`, 500);

    revalidateSite();
    return NextResponse.json({ ok: true });
  }

  return { POST, PATCH, DELETE };
}

/** Standard runtime for these routes -- they are always dynamic. */
export const dynamic = "force-dynamic";