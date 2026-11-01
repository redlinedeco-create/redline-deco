import { CONTACT_INFO } from "@/lib/utils";
import type { Language } from "@/types";

/**
 * Everything the quote form collects, shared by the browser form and the
 * /api/quote route handler so both sides agree on field names and limits.
 *
 * This module is deliberately dependency-free and safe to import from a client
 * component: no "server-only", no Supabase client, no secrets.
 */

/** Private bucket for customer uploads. Never a public bucket. */
export const QUOTE_BUCKET = "quote-attachments";

/** Where enquiries arrive from. */
export const QUOTE_SOURCES = ["quote", "contact"] as const;
export type QuoteSource = (typeof QUOTE_SOURCES)[number];

export const PROJECT_TYPES = ["residential", "commercial", "other"] as const;
export type QuoteProjectType = (typeof PROJECT_TYPES)[number];

export const REQUEST_STATUSES = [
  "new",
  "in_progress",
  "won",
  "lost",
  "spam",
] as const;
export type QuoteStatus = (typeof REQUEST_STATUSES)[number];

/**
 * Field caps. These are not decoration: every one of them bounds what an
 * anonymous visitor can push into the database.
 */
export const LIMITS = {
  name: 120,
  phone: 40,
  email: 200,
  location: 200,
  service: 120,
  area: 60,
  budget: 120,
  description: 4000,
  note: 2000,
  /** 8 files total across photos + documents. */
  files: 8,
  /** Per-file ceiling. Photos are usually a few MB on a phone. */
  fileBytes: 10 * 1024 * 1024,
  /** Whole-request ceiling, so nobody can push 80 MB through a Netlify function. */
  totalBytes: 40 * 1024 * 1024,
} as const;

export const PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/gif",
] as const;

export const DOCUMENT_TYPES = ["application/pdf", ...PHOTO_TYPES] as const;

/** What the browser sends. Attachments travel as files, not as paths. */
export interface QuoteFormValues {
  name: string;
  phone: string;
  email: string;
  location: string;
  projectType: string;
  service: string;
  area: string;
  budget: string;
  preferredDate: string;
  description: string;
}

export const EMPTY_QUOTE: QuoteFormValues = {
  name: "",
  phone: "",
  email: "",
  location: "",
  projectType: "",
  service: "",
  area: "",
  budget: "",
  preferredDate: "",
  description: "",
};

/** One field-level complaint, keyed by form field name. */
export type QuoteFieldErrors = Partial<Record<keyof QuoteFormValues, string>>;

export type QuoteValidation =
  | { ok: true; values: QuoteFormValues }
  | { ok: false; errors: QuoteFieldErrors };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

/** Loose enough for the formats people actually type on a phone keypad. */
export function isPhone(value: string): boolean {
  return /^[+()\-\s\d.]{6,40}$/.test(value);
}

/** Trims, collapses runs of whitespace, and hard-stops at the field cap. */
export function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

/** Keeps line breaks for free-text fields but still bounds the length. */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").trim().slice(0, max);
}

function isProjectType(value: string): value is QuoteProjectType {
  return (PROJECT_TYPES as readonly string[]).includes(value);
}

/**
 * Turns raw input into storable values, or into per-field errors.
 *
 * `detailed` is true for the quote form, which must collect enough to actually
 * price the job: phone, email, location and service are all required. The short
 * contact form on /contact passes false -- there, an email alone is enough to
 * reply to, and demanding a service type would just lose the message.
 */
export function validateQuote(
  input: Partial<QuoteFormValues>,
  options: { detailed?: boolean } = {},
): QuoteValidation {
  const detailed = options.detailed !== false;

  const values: QuoteFormValues = {
    name: clean(input.name, LIMITS.name),
    phone: clean(input.phone, LIMITS.phone),
    email: clean(input.email, LIMITS.email).toLowerCase(),
    location: clean(input.location, LIMITS.location),
    projectType: isProjectType(input.projectType ?? "")
      ? (input.projectType as QuoteProjectType)
      : "other",
    service: clean(input.service, LIMITS.service),
    area: clean(input.area, LIMITS.area),
    budget: clean(input.budget, LIMITS.budget),
    // A date input gives YYYY-MM-DD; anything else is dropped rather than stored.
    preferredDate: /^\d{4}-\d{2}-\d{2}$/.test(input.preferredDate ?? "")
      ? (input.preferredDate as string)
      : "",
    description: cleanText(input.description, LIMITS.description),
  };

  const errors: QuoteFieldErrors = {};

  if (!values.name) errors.name = "required";
  if (!values.description) errors.description = "required";
  else if (values.description.length < 10) errors.description = "short";

  if (detailed) {
    if (!values.phone) errors.phone = "required";
    else if (!isPhone(values.phone)) errors.phone = "phone";
    if (!values.email) errors.email = "required";
    else if (!isEmail(values.email)) errors.email = "email";
    if (!values.location) errors.location = "required";
    if (!values.service) errors.service = "required";
  } else if (!values.email || !isEmail(values.email)) {
    // Short form still needs one address to answer to.
    errors.email = values.email ? "email" : "required";
  }

  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, values };
}

/** What the short contact form on /contact sends. */
export interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const EMPTY_CONTACT: ContactFormValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export type ContactFieldErrors = Partial<
  Record<keyof ContactFormValues, string>
>;

export type ContactValidation =
  | { ok: true; values: ContactFormValues }
  | { ok: false; errors: ContactFieldErrors };

/**
 * The contact form is a message, not an estimate: name, a reply address and
 * something to say. No phone required, because a visitor who would rather write
 * than call should not be made to pick up the phone to send an email.
 */
export function validateContact(
  input: Partial<ContactFormValues>,
): ContactValidation {
  const values: ContactFormValues = {
    name: clean(input.name, LIMITS.name),
    email: clean(input.email, LIMITS.email).toLowerCase(),
    subject: clean(input.subject, LIMITS.name * 2),
    message: cleanText(input.message, LIMITS.description),
  };

  const errors: ContactFieldErrors = {};

  if (!values.name) errors.name = "required";
  if (!values.email) errors.email = "required";
  else if (!isEmail(values.email)) errors.email = "email";
  if (!values.subject) errors.subject = "required";
  if (!values.message) errors.message = "required";
  else if (values.message.length < 10) errors.message = "short";

  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, values };
}

/** Reference letters and digits only, so it can be read aloud on the phone. */
function referenceAlphabet() {
  // No 0/O/1/I/L: these codes get written on a notepad and read back.
  return "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
}

export function makeReference(): string {
  const alphabet = referenceAlphabet();
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `RD-${out}`;
}

/** Storage-safe filename segment. Mirrors the admin uploader's rules. */
export function safeSegment(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : "";
  const allowed = "abcdefghijklmnopqrstuvwxyz0123456789-";
  const stem = (dot > 0 ? name.slice(0, dot) : name)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const cleanStem = (stem || "file").slice(0, 48);
  const cleanExt = /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : "";
  return `${cleanStem}${cleanExt}`;
}

/** Photos and documents land in separate folders inside the private bucket. */
export function quoteStoragePath(
  reference: string,
  kind: "photos" | "documents",
  filename: string,
): string {
  return `${reference}/${kind}/${safeSegment(filename)}`;
}

/**
 * Plain-text summary of a request, used for the WhatsApp handoff and the email
 * fallback. Deliberately readable on a phone screen with labels, because the
 * owner is the one reading it.
 */
export function summaryLines(
  values: QuoteFormValues,
  labels: Record<string, string>,
  locale: Language = "en",
): string {
  const row = (key: keyof QuoteFormValues, value: string) =>
    value ? `${labels[key] ?? key}: ${value}` : "";

  return [
    row("name", values.name),
    row("phone", values.phone),
    row("email", values.email),
    row("location", values.location),
    row("projectType", values.projectType),
    row("service", values.service),
    row("area", values.area),
    row("budget", values.budget),
    row("preferredDate", values.preferredDate),
    row("description", values.description),
  ]
    .filter(Boolean)
    .join("\n");
}

export function whatsappLink(text: string): string {
  return `https://wa.me/${CONTACT_INFO.phoneWhatsapp}?text=${encodeURIComponent(text)}`;
}

export function mailtoLink(
  subject: string,
  body: string,
  to: string = CONTACT_INFO.email,
): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Minimal shape of the translator the forms already hold. */
export type Translate = (path: string) => string;

const FIELD_ERROR_KEYS: Record<string, string> = {
  required: "quote.required",
  email: "quote.invalidEmail",
  phone: "quote.invalidPhone",
  short: "quote.descriptionTooShort",
};

/**
 * Turns a machine-readable field error from /api/quote into translated copy.
 * The server answers with codes rather than sentences so the browser stays the
 * one deciding which language the visitor reads.
 */
export function serverErrorText(
  code: string | undefined,
  t: Translate,
): string {
  const key = code ? FIELD_ERROR_KEYS[code] : undefined;
  return key ? t(key) : t("quote.errors.unexpected");
}
