import { buildCrudHandlers } from "@/lib/admin/crud";
import { fail, requireAdmin, textOrNull } from "@/lib/admin/guards";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const handlers = buildCrudHandlers({
  table: "settings",
  idPrefix: "st",
  label: "setting",
  sortable: false,
  keyColumn: "key",
  sanitize: (body, partial) => {
    const values: Record<string, unknown> = {};
    const has = (k: string) => k in body;

    if (!partial || has("key")) {
      const key = textOrNull(body.key);
      if (!key) return { ok: false, error: "Key is required." };
      values.key = key;
    }
    if (!partial || has("value")) {
      if (body.value == null || typeof body.value !== "object") {
        return { ok: false, error: "Value must be a JSON object." };
      }
      values.value = body.value;
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
    .from("settings")
    .select("*")
    .order("key", { ascending: true });

  if (error) return fail(`Could not read settings: ${error.message}`, 500);
  return NextResponse.json({ settings: data ?? [] });
}
