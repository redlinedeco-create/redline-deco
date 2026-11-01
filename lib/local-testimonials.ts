import fs from "fs";
import path from "path";

export interface StoredSubmission {
  id: string;
  name: string;
  phone: string;
  project?: string | null;
  review: {
    en: string;
    fr: string;
    ar: string;
    phone: string;
    status: "pending" | "approved" | "rejected";
  };
  rating: number | null;
  review_date: string;
  is_placeholder: boolean;
  sort_order: number;
  updated_at: string;
  source: "local_fallback" | "supabase";
}

const STORAGE_PATH = path.join(process.cwd(), "data", "pending-submissions.json");

export function getLocalSubmissions(): StoredSubmission[] {
  try {
    if (!fs.existsSync(STORAGE_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(STORAGE_PATH, "utf-8");
    return JSON.parse(raw) as StoredSubmission[];
  } catch (err) {
    console.error("[local-testimonials] Failed to read local submissions:", err);
    return [];
  }
}

export function saveLocalSubmission(item: StoredSubmission): boolean {
  try {
    const list = getLocalSubmissions();
    list.unshift(item);
    const dir = path.dirname(STORAGE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(list, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[local-testimonials] Failed to save local submission:", err);
    return false;
  }
}

export function updateLocalSubmission(id: string, updates: Partial<StoredSubmission>): boolean {
  try {
    const list = getLocalSubmissions();
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(list, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[local-testimonials] Failed to update local submission:", err);
    return false;
  }
}

export function deleteLocalSubmission(id: string): boolean {
  try {
    const list = getLocalSubmissions();
    const filtered = list.filter((i) => i.id !== id);
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[local-testimonials] Failed to delete local submission:", err);
    return false;
  }
}
