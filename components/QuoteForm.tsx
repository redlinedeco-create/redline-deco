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
} from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";

const types = ["residential", "commercial", "other"] as const;

export function QuoteForm({ compact = false }: { compact?: boolean }) {
  const { t, language, dir } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [docs, setDocs] = useState<File[]>([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    projectType: "",
    service: "",
    area: "",
    budget: "",
    date: "",
    description: "",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    const required: (keyof typeof form)[] = [
      "name",
      "phone",
      "email",
      "location",
      "projectType",
      "service",
      "description",
    ];
    required.forEach((k) => {
      if (!String(form[k]).trim()) errs[k] = t("quote.required");
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = t("quote.invalidEmail");
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    // TODO: Integrate with Email provider (e.g. Resend, Nodemailer)
    // TODO: Integrate with WhatsApp (construct wa.me message with form fields)
    // TODO: Save ContactRequest to database
    // TODO: Integrate with Supabase (contact_requests table)
    // TODO: Integrate with CRM (HubSpot / Zoho / local CRM)

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5 p-8 text-center">
        <div className="mx-auto mb-5 h-16 w-16 grid place-items-center rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
          {t("quote.success").split("!")[0]}!
        </h3>
        <p className="text-muted-foreground leading-relaxed">{t("quote.success")}</p>
      </div>
    );
  }

  const fieldClass = (k: string) =>
    cn(
      "w-full rounded-md border bg-background px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-colors",
      errors[k] ? "border-red-500" : "border-input",
    );

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
              />
            </Field>
            <Field
              label={t("quote.fields.projectType")}
              name="projectType"
              icon={<Home className="h-4 w-4" />}
              required
              error={errors.projectType}
            >
              <select
                name="projectType"
                value={form.projectType}
                onChange={(e) => update("projectType", e.target.value)}
                className={fieldClass("projectType")}
              >
                <option value="">{t("quote.fields.projectTypePlaceholder")}</option>
                {types.map((k) => (
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
                {["drywall", "ceilings", "partitions", "painting", "decorative", "wallFinishing", "renovation", "custom"].map((k) => (
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
            >
              <input
                name="area"
                type="text"
                value={form.area}
                onChange={(e) => update("area", e.target.value)}
                placeholder={t("quote.fields.areaPlaceholder")}
                className={fieldClass("area")}
              />
            </Field>
            <Field
              label={t("quote.fields.budget")}
              name="budget"
              icon={<DollarSign className="h-4 w-4" />}
            >
              <input
                name="budget"
                type="text"
                value={form.budget}
                onChange={(e) => update("budget", e.target.value)}
                placeholder={t("quote.fields.budgetPlaceholder")}
                className={fieldClass("budget")}
              />
            </Field>
            <Field
              label={t("quote.fields.date")}
              name="date"
              icon={<Calendar className="h-4 w-4" />}
            >
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className={fieldClass("date")}
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
            />
            <FileUpload
              label={t("quote.fields.documents")}
              hint={t("quote.fields.documentsHint")}
              icon={<FileIcon className="h-5 w-5" />}
              files={docs}
              setFiles={setDocs}
              accept="application/pdf,image/*"
            />
          </div>

          <div className={cn("pt-2", dir === "rtl" ? "text-left" : "text-right")}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-brand-red text-white px-6 py-3.5 text-base font-semibold shadow-lg shadow-brand-red/20 hover:bg-brand-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 w-full sm:w-auto"
            >
              <Send className={cn("h-5 w-5", dir === "rtl" && "scale-x-[-1]")} />
              {t("quote.submit")}
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
}: {
  label: string;
  hint?: string;
  icon: React.ReactNode;
  files: File[];
  setFiles: (f: File[]) => void;
  accept: string;
}) {
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
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
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
      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-xs text-foreground"
            >
              <span className="truncate">{f.name}</span>
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
