import { NextResponse, type NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase/server";
import { saveLocalSubmission } from "@/lib/local-testimonials";

export const dynamic = "force-dynamic";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > 5000) {
    for (const [key, timestamps] of hits.entries()) {
      const valid = timestamps.filter((at) => now - at < RATE_LIMIT_WINDOW_MS);
      if (valid.length === 0) hits.delete(key);
      else hits.set(key, valid);
    }
  }

  return false;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please wait a while before trying again." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request payload." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const review = typeof body.review === "string" ? body.review.trim() : "";
  const project = typeof body.project === "string" ? body.project.trim() : "";
  const ratingNum = typeof body.rating === "number" ? body.rating : Number(body.rating);

  if (!name || name.length < 2 || name.length > 100) {
    return NextResponse.json(
      { ok: false, error: "Please enter your name (2-100 characters)." },
      { status: 400 }
    );
  }

  if (!phone || phone.length < 6 || phone.length > 30) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid phone number (at least 6 digits)." },
      { status: 400 }
    );
  }

  if (!review || review.length < 5 || review.length > 1500) {
    return NextResponse.json(
      { ok: false, error: "Please write your testimonial (5-1500 characters)." },
      { status: 400 }
    );
  }

  const rating =
    Number.isFinite(ratingNum) && ratingNum >= 1 && ratingNum <= 5
      ? Math.round(ratingNum)
      : null;

  const id = `t-client-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const row = {
    id,
    name,
    project: project || null,
    review: {
      en: review,
      fr: review,
      ar: review,
      phone,
      status: "pending" as const,
    },
    rating,
    review_date: new Date().toISOString().slice(0, 10),
    is_placeholder: false,
    sort_order: 999,
    updated_at: new Date().toISOString(),
  };

  let insertedInDb = false;
  const db = getAdminClient();

  if (db) {
    try {
      // Race Supabase insert with a 4s timeout so an offline/paused database doesn't hang the client
      const insertPromise = db.from("testimonials").insert(row as never);
      const timeoutPromise = new Promise<{ error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase timeout (check if paused)")), 4000)
      );

      const res = (await Promise.race([insertPromise, timeoutPromise])) as { error: any };
      if (!res.error) {
        insertedInDb = true;
      } else {
        console.warn("[testimonials] Supabase insert warning:", res.error.message || res.error);
      }
    } catch (err: any) {
      console.warn("[testimonials] Supabase unreachable or paused:", err?.message || err);
    }
  }

  // If Supabase was unreachable, paused, or errored, save to local fallback storage
  if (!insertedInDb) {
    const savedLocally = saveLocalSubmission({
      ...row,
      phone,
      source: "local_fallback",
    });

    if (!savedLocally) {
      return NextResponse.json(
        { ok: false, error: "Unable to save testimonial right now. Please try again later." },
        { status: 500 }
      );
    }
    console.info("[testimonials] Saved review to local fallback buffer (Supabase paused/offline).");
  }

  return NextResponse.json(
    {
      ok: true,
      message: "Thank you! Your testimonial has been submitted and will appear on the site once approved.",
    },
    { status: 201 }
  );
}
