import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { buildCrudHandlers } from "@/lib/admin/crud";
import {
  fail,
  hasAnyTranslation,
  i18nOrNull,
  intOrNull,
  newId,
  requireAdmin,
  textOrNull,
} from "@/lib/admin/guards";
import {
  deleteLocalSubmission,
  getLocalSubmissions,
  updateLocalSubmission,
} from "@/lib/local-testimonials";

export const dynamic = "force-dynamic";

const AFFECTED_PATHS = ["/", "/portfolio", "/prices", "/services", "/admin", "/about"];

function revalidateSite() {
  revalidateTag("content");
  for (const path of AFFECTED_PATHS) revalidatePath(path);
}

const defaultHandlers = buildCrudHandlers({
  table: "testimonials",
  idPrefix: "t",
  label: "testimonial",
  sortable: true,
  sanitize: (body, partial) => {
    const values: Record<string, unknown> = {};
    const has = (k: string) => k in body;

    if (!partial || has("name")) {
      const name = textOrNull(body.name);
      if (!name) return { ok: false, error: "Please enter the client name." };
      values.name = name;
    }

    if (!partial || has("project")) values.project = textOrNull(body.project);

    if (!partial || has("review")) {
      const review = i18nOrNull(body.review);
      if (!hasAnyTranslation(review)) {
        return {
          ok: false,
          error: "Please write the review in at least one language.",
        };
      }
      values.review = review;
    }

    if (!partial || has("rating")) {
      const rating = intOrNull(body.rating);
      values.rating = rating !== null && rating >= 1 && rating <= 5 ? rating : null;
    }

    if (!partial || has("review_date")) values.review_date = textOrNull(body.review_date);

    if (!partial || has("is_placeholder"))
      values.is_placeholder = body.is_placeholder === true;

    if (!partial || has("sort_order")) {
      const order = intOrNull(body.sort_order);
      if (order !== null) values.sort_order = order;
    }

    return { ok: true, values };
  },
});

/** Full list in display order. Used by the dashboard on a cold load. */
export async function GET() {
  const guard = await requireAdmin();
  const localList = getLocalSubmissions();

  if (guard.error) {
    // If not signed in or DB not configured, return guard error
    if (!guard.db) return guard.error;
  }

  let dbRows: any[] = [];
  if (guard.db) {
    try {
      const { data, error } = await guard.db
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!error && data) {
        dbRows = data;
      }
    } catch (err) {
      console.warn("[admin/testimonials] Failed to read from Supabase:", err);
    }
  }

  const existingIds = new Set(dbRows.map((r) => r.id));
  const merged = [...dbRows];

  for (const localItem of localList) {
    if (!existingIds.has(localItem.id)) {
      merged.push(localItem);
    }
  }

  const testimonials = merged.map((row: any) => {
    const rev = row.review && typeof row.review === "object" ? row.review : {};
    return {
      ...row,
      phone: row.phone || rev.phone || "",
      status: row.status || rev.status || "approved",
    };
  });

  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = textOrNull(body.name);
  if (!name) return fail("Please enter the client name.");

  const review = i18nOrNull(body.review);
  if (!hasAnyTranslation(review)) {
    return fail("Please write the review in at least one language.");
  }

  const rating = intOrNull(body.rating);
  const status = textOrNull(body.status) || "approved";
  const phone = textOrNull(body.phone) || null;

  const reviewWithMeta = {
    ...review,
    phone,
    status,
  };

  const id = newId("t");
  const row = {
    id,
    name,
    project: textOrNull(body.project),
    review: reviewWithMeta,
    rating: rating !== null && rating >= 1 && rating <= 5 ? rating : null,
    review_date: textOrNull(body.review_date),
    is_placeholder: body.is_placeholder === true,
    sort_order: 0,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await guard.db
    .from("testimonials")
    .insert(row as never)
    .select()
    .single();

  if (error) return fail(`Could not create testimonial: ${error.message}`, 500);

  revalidateSite();
  return NextResponse.json(
    {
      testimonial: {
        ...data,
        phone: phone || "",
        status,
      },
    },
    { status: 201 },
  );
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) return fail("Missing id.");

  // Check if item exists in local submissions fallback
  const localList = getLocalSubmissions();
  const localItem = localList.find((i) => i.id === id);

  if (localItem) {
    const s = textOrNull(body.status);
    const updatedStatus = s && ["pending", "approved", "rejected"].includes(s) ? s : localItem.review.status;
    const phone = "phone" in body ? textOrNull(body.phone) || "" : localItem.phone;

    const newRev = {
      ...localItem.review,
      phone,
      status: updatedStatus as "pending" | "approved" | "rejected",
    };

    updateLocalSubmission(id, {
      ...("name" in body && body.name ? { name: String(body.name) } : {}),
      phone,
      review: newRev,
    });

    if (guard.db) {
      try {
        await guard.db.from("testimonials").upsert({
          id: localItem.id,
          name: "name" in body && body.name ? String(body.name) : localItem.name,
          project: localItem.project,
          review: newRev,
          rating: localItem.rating,
          review_date: localItem.review_date,
          is_placeholder: false,
          sort_order: 999,
          updated_at: new Date().toISOString(),
        });
      } catch {
        // Silently ignore if Supabase is offline/paused
      }
    }

    revalidateSite();
    return NextResponse.json({
      testimonial: {
        ...localItem,
        phone,
        status: updatedStatus,
      },
    });
  }

  const { data: current } = await guard.db
    .from("testimonials")
    .select("*")
    .eq("id", id)
    .single();

  if (!current) return fail("Testimonial not found.", 404);

  const updates: Record<string, unknown> = {};

  if ("name" in body && body.name) updates.name = textOrNull(body.name);
  if ("project" in body) updates.project = textOrNull(body.project);
  if ("rating" in body) {
    const rating = intOrNull(body.rating);
    updates.rating = rating !== null && rating >= 1 && rating <= 5 ? rating : null;
  }
  if ("review_date" in body) updates.review_date = textOrNull(body.review_date);
  if ("is_placeholder" in body) updates.is_placeholder = body.is_placeholder === true;
  if ("sort_order" in body) {
    const order = intOrNull(body.sort_order);
    if (order !== null) updates.sort_order = order;
  }

  const currentReview =
    current.review && typeof current.review === "object"
      ? (current.review as Record<string, unknown>)
      : { en: "", fr: "", ar: "" };

  const newReview = { ...currentReview };
  if ("review" in body && body.review && typeof body.review === "object") {
    const revObj = body.review as Record<string, unknown>;
    if (typeof revObj.en === "string") newReview.en = revObj.en;
    if (typeof revObj.fr === "string") newReview.fr = revObj.fr;
    if (typeof revObj.ar === "string") newReview.ar = revObj.ar;
  }

  if ("phone" in body) {
    newReview.phone = textOrNull(body.phone);
  }

  if ("status" in body) {
    const s = textOrNull(body.status);
    newReview.status = s && ["pending", "approved", "rejected"].includes(s) ? s : "approved";
  }

  updates.review = newReview;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await guard.db
    .from("testimonials")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) return fail(`Could not update testimonial: ${error.message}`, 500);

  revalidateSite();
  return NextResponse.json({
    testimonial: {
      ...data,
      phone: (data?.review as any)?.phone || "",
      status: (data?.review as any)?.status || "approved",
    },
  });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  if (!id) return fail("Missing id.");

  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  // 1. Delete from local fallback storage if present
  deleteLocalSubmission(id);

  // 2. Try deleting from Supabase with a short timeout so offline/paused DB doesn't hang
  if (guard.db) {
    try {
      await Promise.race([
        guard.db.from("testimonials").delete().eq("id", id),
        new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 1500)),
      ]);
    } catch (err) {
      console.warn("[admin/testimonials] DB delete skipped/timed out:", err);
    }
  }

  revalidateSite();
  return NextResponse.json({ ok: true });
}
