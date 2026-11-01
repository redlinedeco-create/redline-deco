"use client";

/**
 * Thin client wrappers over /api/admin. Every call goes through the route
 * handlers rather than straight to Supabase, because the anon key cannot write
 * and the service_role key must never reach the browser.
 *
 * Responses carry the raw database row (snake_case), which is exactly what
 * AdminDashboard's normalize* helpers expect.
 */

type Row = Record<string, unknown>;

async function request<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers:
        init.body instanceof FormData
          ? init.headers
          : { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
  } catch {
    throw new Error("Could not reach the server. Check your connection.");
  }

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : "") || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return (body ?? {}) as T;
}

const post = <T,>(path: string, payload: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(payload) });

const patch = <T,>(path: string, payload: unknown) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(payload) });

const remove = (path: string, params: Record<string, string>) => {
  const qs = new URLSearchParams(params).toString();
  return request<{ ok: boolean }>(`${path}?${qs}`, { method: "DELETE" });
};

/** Builds the calls every entity needs from its route path. */
function entity<T extends Row>(route: string, key: string) {
  return {
    async list() {
      return request<Record<string, T[]>>(`/api/admin/${route}`);
    },
    async create(payload: Record<string, unknown>) {
      return post<Record<string, T>>(`/api/admin/${route}`, payload);
    },
    async update(payload: Record<string, unknown>) {
      return patch<Record<string, T>>(`/api/admin/${route}`, payload);
    },
    async remove(id: string) {
      return remove(`/api/admin/${route}`, { id });
    },
  };
}

export const AdminProjects = entity<Row>("projects", "project");
export const AdminCategories = entity<Row>("categories", "category");
export const AdminServices = entity<Row>("services", "service");
export const AdminPrices = entity<Row>("prices", "price");
export const AdminTestimonials = entity<Row>("testimonials", "testimonial");
export const AdminSettings = entity<Row>("settings", "setting");
export const AdminSiteText = entity<Row>("site-text", "siteText");

export type MediaItem = {
  id: string;
  path: string;
  filename: string;
  mime: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  folder: string;
  created_at: string;
};

export const AdminUpload = {
  /** The media library, newest first. */
  async list(folder?: string) {
    const qs = folder ? `?folder=${encodeURIComponent(folder)}` : "";
    const { media } = await request<{ media: MediaItem[] }>(
      `/api/admin/upload${qs}`,
    );
    return media ?? [];
  },

  /** Uploads one or more files, returns the stored paths. */
  async upload(files: File[], folder = "general") {
    const form = new FormData();
    form.set("folder", folder);
    for (const file of files) form.append("files", file);

    const { media, errors } = await request<{
      media: MediaItem[];
      errors?: string[];
    }>("/api/admin/upload", { method: "POST", body: form });

    return { media: media ?? [], errors: errors ?? [] };
  },

  async remove(path: string) {
    return remove("/api/admin/upload", { path });
  },
};

/** One attachment as the inbox returns it: a private path plus a signed URL. */
export type RequestAttachment = {
  path: string;
  name: string;
  url: string | null;
};

/** A row of contact_requests after /api/admin/requests has signed its files. */
export type ContactRequestRow = {
  id: string;
  reference: string;
  name: string;
  phone: string | null;
  email: string;
  subject: string | null;
  location: string | null;
  project_type: string | null;
  service: string | null;
  area: string | null;
  budget: string | null;
  preferred_date: string | null;
  description: string;
  photos: RequestAttachment[];
  documents: RequestAttachment[];
  locale: string;
  source: "quote" | "contact";
  status: "new" | "in_progress" | "won" | "lost" | "spam";
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * The enquiry inbox. Unlike the entity helpers above it returns a list rather
 * than a single row, because the tab is a feed: load, scan, act on one.
 */
export const AdminRequests = {
  async list(status = "all") {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    const { requests, newCount } = await request<{
      requests: ContactRequestRow[];
      newCount: number;
    }>(`/api/admin/requests${qs}`);
    return { requests: requests ?? [], newCount: newCount ?? 0 };
  },

  async update(id: string, values: Record<string, unknown>) {
    const { request: row } = await patch<{ request: ContactRequestRow }>(
      "/api/admin/requests",
      { id, ...values },
    );
    return row;
  },

  /** Reports a warning when the row went but the customer's files did not. */
  async remove(id: string) {
    return request<{ ok: boolean; warning?: string }>(
      `/api/admin/requests?id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
  },
};