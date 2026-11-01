import { NextResponse } from "next/server";

import { buildCrudHandlers } from "@/lib/admin/crud";
import {
  fail,
  hasAnyTranslation,
  i18nOrNull,
  numOrNull,
  requireAdmin,
  textOrNull,
} from "@/lib/admin/guards";

export const dynamic = "force-dynamic";

/** lucide-react icon names offered in the editor. */
const ICONS = [
  "Layers",
  "PanelTop",
  "Brush",
  "PaintRoller",
  "Palette",
  "Hammer",
  "Sparkles",
  "PaintBucket",
  "Ruler",
  "Droplets",
] as const;

const handlers = buildCrudHandlers({
  table: "services",
  sortable: true,
  idPrefix: "svc-",
  label: "service",
  sanitize: (body, partial) => {
    const values: Record<string, unknown> = {};
    const has = (k: string) => k in body;

    if (!partial || has("name")) {
      const name = i18nOrNull(body.name);
      if (!hasAnyTranslation(name)) {
        return { ok: false, error: "Please enter a service name in at least one language." };
      }
      values.name = name;
    }

    if (!partial || has("description")) {
      values.description = i18nOrNull(body.description);
    }

    if (!partial || has("icon")) {
      const icon = textOrNull(body.icon) ?? "Layers";
      if (!(ICONS as readonly string[]).includes(icon)) {
        return { ok: false, error: `Unknown icon "${icon}".` };
      }
      values.icon = icon;
    }

    if (!partial || has("starting_price")) {
      const price = numOrNull(body.starting_price);
      if (price !== null && price < 0) {
        return { ok: false, error: "Starting price cannot be negative." };
      }
      values.starting_price = price;
    }

    if (!partial || has("unit")) values.unit = i18nOrNull(body.unit);

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
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return fail(`Could not read services: ${error.message}`, 500);
  return NextResponse.json({ services: data ?? [] });
}