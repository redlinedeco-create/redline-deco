"use client";

import { useState } from "react";
import {
  Upload,
  Send,
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  Ruler,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  X,
  ImagePlus,
  FileIcon,
  Loader2,
  AlertTriangle,
  Hash,
} from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import { EnquiryFallback } from "./EnquiryFallback";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";
import {
  EMPTY_QUOTE,
  LIMITS,
  PROJECT_TYPES,
  serverErrorText,
  summaryLines,
  type QuoteFormValues,
} from "@/lib/quote";

/**
 * The quote form.
 *
 * Everything it sends lands in /api/quote, which validates again server side,
 * rate limits, and stores the enquiry in `contact_requests` for the admin
 * Requests tab. The browser never touches Supabase for this: the anon key
 * cannot write to that table on purpose (see supabase/schema.sql).
 *
 * When the endpoint answers 503 the form does not lie about having sent
 * anything -- it falls back to WhatsApp and email with the message already
 * written out, so an enquiry is never a dead end.
 */

/** Keys the form fills with a real service. The rest of the i18n list is unused. */
const serviceKeys = [
  "drywall",
  "ceilings",
  "partitions",
  "interiorPainting",
  "decorativePainting",
  "wallFinishing",
  "renovation",
  "custom",
] as const;

type SubmitState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done"; reference: string }
  | { kind: "error"; message: string; code?: string; fields?: Record<string, string> }
  | { kind: "unconfigured" };

export function QuoteForm({ compact = false }: { compact?: boolean }) {
  const { t, language, dir } = useLanguage();
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [docs, setDocs] = useState<File[]>([]);
  const [form, setForm] = useState<QuoteFormValues>(EMPTY_QUOTE);
  /** Honeypot: only a bot fills this in. Hidden, not "required", never sent back. */
  const [website, setWebsite] = useState("");

  const submitting = state.kind === "sending";

  function update<K extends keyof QuoteFormValues>(
    k: K,
    v: QuoteFormValues[K],
  ) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  }

  /** Same rules as the server, so nothing is rejected twice over. */
  function validate() {
    const errs: Record<string, string> = {};
    const required: (keyof QuoteFormValues)[] = [
      "name",
      "phone",
      "email",
      "location",
      "service",
      "description",
    ];
    required.forEach((k) => {
      if (!String(form[k]).trim()) errs[k] = t("quote.required");
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = t("quote.invalidEmail");
    }
    if (form.description && form.description.trim().length < 10) {
      errs.description = t("quote.descriptionTooShort");
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /** Banner copy for a request-level failure (as opposed to a field error). */
  function bannerFor(code?: string): string | null {
    if (code === "rate_limited") return t("quote.errors.rateLimited");
    if (code === "too_many_files") return t("quote.errors.tooManyFiles");
    if (code === "file_too_large") return t("quote.errors.fileTooLarge");
    return null;
  }

  /** The server sends codes; the browser decides the language they are read in. */
  function mapFieldErrors(raw: unknown): Record<string, string> {
    const out: Record<string, string> = {};
    if (raw && typeof raw === "object") {
      for (const [field, code] of Object.entries(raw as Record<string, string>)) {
        out[field] = serverErrorText(code, t);
      }
    }
    return out;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    const body = new FormData();
    for (const [key, value] of Object.entries(form)) body.set(key, value);
    body.set("locale", language);
    body.set("source", "quote");
    body.set("website", website);
    for (const file of photos) body.append("photos", file);
    for (const file of docs) body.append("documents", file);

    setState({ kind: "sending" });

    let res: Response;
    try {
      res = await fetch("/api/quote", { method: "POST", body });
    } catch {
      setState({ kind: "error", message: t("quote.errors.network") });
      return;
    }

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (res.ok && data?.reference) {
      setState({ kind: "done", reference: String(data.reference) });
      setForm(EMPTY_QUOTE);
      setPhotos([]);
      setDocs([]);
      setErrors({});
      setWebsite("");
      return;
    }

    if (res.status === 503 || data?.code === "not_configured") {
      setState({ kind: "unconfigured" });
      return;
    }

    if (res.status === 422) {
      const mapped = mapFieldErrors(data?.fields);
      setErrors(mapped);
      setState({
        kind: "error",
        message: t("quote.errors.checkFields"),
        code: data?.code,
        fields: mapped,
      });
      return;
    }

    setState({
      kind: "error",
      message: bannerFor(data?.code) ?? data?.error ?? t("quote.errors.unexpected"),
      code: data?.code,
    });
  }

  if (state.kind === "done") {
    return (
      <section id="quote" className="section-padding bg-muted/40">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5 p-8 text-center">
            <div className="mx-auto mb-5 h-16 w-16 grid place-items-center rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
              {t("quote.success").split("!")[0]}!
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t("quote.success")}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5">
              <Hash className="h-4 w-4 text-brand-red" />
              <span className="text-xs text-muted-foreground">
                {t("quote.referenceLabel")}
              </span>
              <span className="font-mono font-bold tracking-wider">
                {state.reference}
              </span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {t("quote.referenceHint")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const fieldClass = (k: string) =>
    cn(
      "w-full rounded-md border bg-background px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-colors",
      errors[k] ? "border-red-500" : "border-input",
      submitting && "opacity-70",
    );

  const labels = {
    name: t("quote.fields.name"),
    phone: t("quote.fields.phone"),
    email: t("quote.fields.email"),
    location: t("quote.fields.location"),
    projectType: t("quote.fields.projectType"),
    service: t("quote.fields.service"),
    area: t("quote.fields.area"),
    budget: t("quote.fields.budget"),
    preferredDate: t("quote.fields.date"),
    description: t("quote.fields.description"),
  };

  return (
    <section id="quote" className="section-padding bg-muted/40">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {!compact && (
          <SectionTitle
            eyebrow={t("nav.quote")}
            titleI18n="quote.title"
            subtitleI18n="quote.subtitle"
          />
        )}

        {state.kind === "unconfigured" && (
          <EnquiryFallback
            summary={summaryLines(form, labels, language)}
            title={t("quote.fallback.title")}
            hint={t("quote.fallback.subtitle")}
            subject={t("quote.fallback.subject")}
          />
        )}

        {state.kind === "error" && !state.fields && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{state.message}</span>
          </div>
        )}

        <form
          onSubmit={onSubmit}
          noValidate
          className="rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-sm space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Field
              label={t("quote.fields.name")}
              name="name"
              icon={<User className="h-4 w-4" />}
              required
              error={errors.name}
            >
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder={t("quote.fields.namePlaceholder")}
                className={fieldClass("name")}
                autoComplete="name"
                maxLength={LIMITS.name}
              />
            </Field>
            <Field
              label={t("quote.fields.phone")}
              name="phone"
              icon={<Phone className="h-4 w-4" />}
              required
              error={errors.phone}
            >
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder={t("quote.fields.phonePlaceholder")}
                className={fieldClass("phone")}
                autoComplete="tel"
                maxLength={LIMITS.phone}
              />
            </Field>
            <Field
              label={t("quote.fields.email")}
              name="email"
              icon={<Mail className="h-4 w-4" />}
              required
              error={errors.email}
            >
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder={t("quote.fields.emailPlaceholder")}
                className={fieldClass("email")}
                autoComplete="email"
                maxLength={LIMITS.email}
              />
            </Field>
            <Field
              label={t("quote.fields.location")}
              name="location"
              icon={<MapPin className="h-4 w-4" />}
              required
              error={errors.location}
            >
              <input
                name="location"
                type="text"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder={t("quote.fields.locationPlaceholder")}
                className={fieldClass("location")}
                maxLength={LIMITS.location}
              />
            </Field>
            <Field
              label={t("quote.fields.projectType")}
              name="projectType"
              icon={<Home className="h-4 w-4" />}
              error={errors.projectType}
            >
              <select
                name="projectType"
                value={form.projectType}
                onChange={(e) => update("projectType", e.target.value)}
                className={fieldClass("projectType")}
              >
                <option value="">{t("quote.fields.projectTypePlaceholder")}</option>
                {PROJECT_TYPES.map((k) => (
                  <option key={k} value={k}>
                    {t(`quote.fields.types.${k}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label={t("quote.fields.service")}
              name="service"
              icon={<FileText className="h-4 w-4" />}
              required
              error={errors.service}
            >
              <select
                name="service"
                value={form.service}
                onChange={(e) => update("service", e.target.value)}
                className={fieldClass("service")}
              >
                <option value="">{t("quote.fields.servicePlaceholder")}</option>
                {serviceKeys.map((k) => (
                  <option key={k} value={k}>
                    {t(`services.items.${k}.name`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label={t("quote.fields.area")}
              name="area"
              icon={<Ruler className="h-4 w-4" />}
              error={errors.area}
            >
              <input
                name="area"
                type="text"
                value={form.area}
                onChange={(e) => update("area", e.target.value)}
                placeholder={t("quote.fields.areaPlaceholder")}
                className={fieldClass("area")}
                maxLength={LIMITS.area}
              />
            </Field>
            <Field
              label={t("quote.fields.budget")}
              name="budget"
              icon={<DollarSign className="h-4 w-4" />}
              error={errors.budget}
            >
              <input
                name="budget"
                type="text"
                value={form.budget}
                onChange={(e) => update("budget", e.target.value)}
                placeholder={t("quote.fields.budgetPlaceholder")}
                className={fieldClass("budget")}
                maxLength={LIMITS.budget}
              />
            </Field>
            <Field
              label={t("quote.fields.date")}
              name="date"
              icon={<Calendar className="h-4 w-4" />}
              error={errors.date}
            >
              <input
                name="date"
                type="date"
                value={form.preferredDate}
                onChange={(e) => update("preferredDate", e.target.value)}
                className={fieldClass("preferredDate")}
              />
            </Field>
          </div>

          <Field
            label={t("quote.fields.description")}
            name="description"
            icon={<FileText className="h-4 w-4" />}
            required
            error={errors.description}
          >
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder={t("quote.fields.descriptionPlaceholder")}
              className={cn(fieldClass("description"), "resize-y")}
              maxLength={LIMITS.description}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <FileUpload
              label={t("quote.fields.photos")}
              hint={t("quote.fields.photosHint")}
              icon={<ImagePlus className="h-5 w-5" />}
              files={photos}
              setFiles={setPhotos}
              accept="image/*"
              maxFiles={LIMITS.files}
            />
            <FileUpload
              label={t("quote.fields.documents")}
              hint={t("quote.fields.documentsHint")}
              icon={<FileIcon className="h-5 w-5" />}
              files={docs}
              setFiles={setDocs}
              accept="application/pdf,image/*"
              maxFiles={LIMITS.files}
            />
          </div>

          {/* Honeypot. Visually hidden, tabIndex -1, so only scripted fillers touch it. */}
          <div aria-hidden="true" className="sr-only">
            <label htmlFor="quote-website">Website</label>
            <input
              id="quote-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className={cn("pt-2", dir === "rtl" ? "text-left" : "text-right")}>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-md bg-brand-red text-white px-6 py-3.5 text-base font-semibold shadow-lg shadow-brand-red/20 hover:bg-brand-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className={cn("h-5 w-5 animate-spin")} />
              ) : (
                <Send
                  className={cn("h-5 w-5", dir === "rtl" && "scale-x-[-1]")}
                />
              )}
              {submitting ? t("quote.sending") : t("quote.submit")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  icon,
  required,
  error,
  children,
  name,
}: {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  name: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1.5"
      >
        {icon ? <span className="text-brand-red">{icon}</span> : null}
        {label}
        {required ? <span className="text-brand-red">*</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}

function FileUpload({
  label,
  hint,
  icon,
  files,
  setFiles,
  accept,
  maxFiles,
}: {
  label: string;
  hint?: string;
  icon: React.ReactNode;
  files: File[];
  setFiles: (f: File[]) => void;
  accept: string;
  maxFiles: number;
}) {
  const { t } = useLanguage();
  const [overLimit, setOverLimit] = useState(false);

  function add(list: FileList | null) {
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    const combined = [...files, ...incoming];
    const next = combined.slice(0, maxFiles);
    setOverLimit(next.length < combined.length);
    setFiles(next);
  }

  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1.5">
        <span className="text-brand-red">{icon}</span>
        {label}
      </label>
      <div className="relative">
        <input
          type="file"
          multiple
          accept={accept}
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
          className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        <div className="rounded-lg border-2 border-dashed border-border bg-background hover:border-brand-red/50 hover:bg-muted/50 transition-colors px-4 py-6 text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-red/10 text-brand-red mb-2">
            <Upload className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        </div>
      </div>
      {overLimit && (
        <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-400">
          {String(t("quote.filesMax")).replace("{n}", String(maxFiles))}
        </p>
      )}
      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-xs text-foreground"
            >
              <span className="truncate">{f.name}</span>
              <span className="shrink-0 text-muted-foreground">
                {(f.size / 1024 / 1024).toFixed(1)} MB
              </span>
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                aria-label="remove file"
                className="shrink-0 text-muted-foreground hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
