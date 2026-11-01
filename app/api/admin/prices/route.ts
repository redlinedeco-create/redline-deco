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

const handlers = buildCrudHandlers({
  table: "prices",
  sortable: true,
  idPrefix: "price-",
  label: "price",
  sanitize: (body, partial) => {
    const values: Record<string, unknown> = {};
    const has = (k: string) => k in body;

    if (!partial || has("service")) {
      const service = i18nOrNull(body.service);
      if (!hasAnyTranslation(service)) {
        return { ok: false, error: "Please enter a service name in at least one language." };
      }
      values.service = service;
    }

    if (!partial || has("description")) {
      values.description = i18nOrNull(body.description);
    }

    if (!partial || has("unit")) values.unit = i18nOrNull(body.unit);

    if (!partial || has("category")) values.category = textOrNull(body.category);

    if (!partial || has("price_from")) {
      const from = numOrNull(body.price_from);
      if (from === null || from < 0) {
        return { ok: false, error: "Please enter a starting price of zero or more." };
      }
      values.price_from = from;
    }

    if (!partial || has("price_to")) {
      const to = numOrNull(body.price_to);
      if (to !== null && to < 0) {
        return { ok: false, error: '"Price up to" cannot be negative.' };
      }
      // Checked against whatever price_from is in the same request; the DB
      // constraint is the backstop when only price_to is being edited.
      const from = numOrNull(body.price_from);
      if (to !== null && from !== null && to < from) {
        return { ok: false, error: '"Price up to" cannot be lower than "Price from".' };
      }
      values.price_to = to;
    }

    if (!partial || has("currency")) {
      values.currency = textOrNull(body.currency) ?? "DZD";
    }

    if (!partial || has("notes")) values.notes = i18nOrNull(body.notes);

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
    .from("prices")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return fail(`Could not read prices: ${error.message}`, 500);
  return NextResponse.json({ prices: data ?? [] });
}