import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { buildCrudHandlers } from "@/lib/admin/crud";
import {
  fail,
  hasAnyTranslation,
  i18nOrNull,
  requireAdmin,
  textOrNull,
} from "@/lib/admin/guards";

export const dynamic = "force-dynamic";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Projects and prices reference a category by slug, so a category can only be
 * removed once nothing points at it. Deleting anyway would orphan real content,
 * so this refuses and reports the counts instead.
 */
async function checkInUse(db: SupabaseClient, slug: string): Promise<string | null> {
  const [projects, prices] = await Promise.all([
    db.from("projects").select("id", { count: "exact", head: true }).eq("category", slug),
    db.from("prices").select("id", { count: "exact", head: true }).eq("category", slug),
  ]);

  const n = (projects.count ?? 0) + (prices.count ?? 0);
  if (n === 0) return null;

  const parts: string[] = [];
  if (projects.count) {
    parts.push(`${projects.count} project${projects.count === 1 ? "" : "s"}`);
  }
  if (prices.count) {
    parts.push(`${prices.count} price entr${prices.count === 1 ? "y" : "ies"}`);
  }
  return `This category is still used by ${parts.join(" and ")}. Move them to another category first.`;
}

const handlers = buildCrudHandlers({
  table: "categories",
  sortable: true,
  idPrefix: "cat-",
  label: "category",
  checkDelete: checkInUse,
  sanitize: (body, partial) => {
    const values: Record<string, unknown> = {};
    const has = (k: string) => k in body;

    if (!partial || has("name")) {
      const name = i18nOrNull(body.name);
      if (!hasAnyTranslation(name)) {
        return { ok: false, error: "Please enter a name in at least one language." };
      }
      values.name = name;
    }

    if (!partial || has("slug")) {
      const slug = textOrNull(body.slug);
      if (!slug || !SLUG.test(slug)) {
        return {
          ok: false,
          error:
            "Slug is required and must be lowercase letters, numbers and dashes only (e.g. drywall).",
        };
      }
      values.slug = slug;
    }

    if (!partial || has("description")) {
      values.description = i18nOrNull(body.description);
    }

    return { ok: true, values };
  },
});

export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { data, error } = await guard.db
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return fail(`Could not read categories: ${error.message}`, 500);
  return NextResponse.json({ categories: data ?? [] });
}