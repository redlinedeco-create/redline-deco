import { buildCrudHandlers } from "@/lib/admin/crud";
import {
  fail,
  hasAnyTranslation,
  i18nOrNull,
  intOrNull,
  stringArray,
  textOrNull,
} from "@/lib/admin/guards";
import { requireAdmin } from "@/lib/admin/guards";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const handlers = buildCrudHandlers({
  table: "projects",
  sortable: true,
  idPrefix: "p",
  label: "project",
  sanitize: (body, partial) => {
    const values: Record<string, unknown> = {};
    const has = (k: string) => k in body;

    if (!partial || has("title")) {
      const title = i18nOrNull(body.title);
      if (!hasAnyTranslation(title)) {
        return { ok: false, error: "Please enter a title in at least one language." };
      }
      values.title = title;
    }

    if (!partial || has("slug")) {
      const slug = textOrNull(body.slug);
      if (!slug || !SLUG.test(slug)) {
        return {
          ok: false,
          error:
            "Slug is required and must be lowercase letters, numbers and dashes only (e.g. modern-apartment).",
        };
      }
      values.slug = slug;
    }

    if (!partial || has("category")) {
      const category = textOrNull(body.category);
      if (!category) return { ok: false, error: "Please choose a category." };
      values.category = category;
    }

    if (!partial || has("location")) {
      const location = i18nOrNull(body.location);
      if (!hasAnyTranslation(location)) {
        return { ok: false, error: "Please enter a location in at least one language." };
      }
      values.location = location;
    }

    if (!partial || has("description")) {
      values.description = i18nOrNull(body.description);
    }

    if (!partial || has("year")) {
      const year = intOrNull(body.year);
      if (year === null && !partial) {
        return { ok: false, error: "Please enter the year." };
      }
      values.year = year;
    }

    if (!partial || has("services")) values.services = stringArray(body.services);
    if (!partial || has("cover_path")) values.cover_path = textOrNull(body.cover_path);
    if (!partial || has("images")) values.images = stringArray(body.images);
    if (!partial || has("before_path")) values.before_path = textOrNull(body.before_path);
    if (!partial || has("after_path")) values.after_path = textOrNull(body.after_path);

    if (!partial || has("featured")) values.featured = body.featured === true;

    if (!partial) {
      const createdAt = textOrNull(body.created_at);
      values.created_at = createdAt ?? new Date().toISOString().slice(0, 10);
    }

    return { ok: true, values };
  },
});

export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;

/** Full list, newest sort_order last. Used by the dashboard on a cold load. */
export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { data, error } = await guard.db
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return fail(`Could not read projects: ${error.message}`, 500);
  return NextResponse.json({ projects: data ?? [] });
}