"use client";

import { useMemo, useState, type FormEvent } from "react";

import type { Category, Price, Project, ServiceItem, Testimonial } from "@/types";
import { toStoragePath } from "@/lib/media";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import {
  CheckboxField,
  FormActions,
  I18nField,
  SingleImagePicker,
  TextAreaField,
  TextField,
  inputClass,
  type I18nText,
} from "./AdminForms";

type Submit = (payload: Record<string, unknown>) => Promise<void> | void;

const empty = (): I18nText => ({ en: "", fr: "", ar: "" });
const from = (v?: Partial<I18nText>): I18nText => ({
  en: v?.en ?? "",
  fr: v?.fr ?? "",
  ar: v?.ar ?? "",
});

/** Keeps only non-blank languages, so an untouched tab stores null not "". */
function cleanI18n(v: I18nText): Record<string, string> {
  const out: Record<string, string> = {};
  for (const lang of ["en", "fr", "ar"] as const) {
    const text = (v[lang] ?? "").trim();
    if (text) out[lang] = text;
  }
  return out;
}

const hasText = (v: I18nText) =>
  (["en", "fr", "ar"] as const).some((l) => (v[l] ?? "").trim().length > 0);

/** "My Project" -> "my-project" */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function useFormError() {
  const [error, setError] = useState<string | null>(null);
  const node = error ? (
    <p
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
    >
      {error}
    </p>
  ) : null;
  return { error, setError, node };
}

/* ------------------------------------------------------------------ *
 * Project
 * ------------------------------------------------------------------ */

export function ProjectForm({
  initial,
  categories,
  services,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: Project;
  categories: Category[];
  services: { value: string; label: string }[];
  onSubmit: Submit;
  onCancel: () => void;
  loading?: boolean;
}) {
  const { t, language } = useLanguage();
  const { setError, node: errorNode } = useFormError();

  const [title, setTitle] = useState<I18nText>(from(initial?.title));
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [category, setCategory] = useState(initial?.category ?? "");
  const [location, setLocation] = useState<I18nText>(from(initial?.location));
  const [year, setYear] = useState(initial?.year ? String(initial.year) : "");
  const [description, setDescription] = useState<I18nText>(
    from(initial?.description),
  );
  const [selected, setSelected] = useState<string[]>(initial?.services ?? []);
  const [cover, setCover] = useState(
    initial?.coverImage ? toStoragePath(initial.coverImage) : "",
  );
  const [images, setImages] = useState<string[]>(
    (initial?.images ?? []).map(toStoragePath),
  );
  const [before, setBefore] = useState(
    initial?.beforeImage ? toStoragePath(initial.beforeImage) : "",
  );
  const [after, setAfter] = useState(
    initial?.afterImage ? toStoragePath(initial.afterImage) : "",
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  // Suggest a slug from the title in the current language until it is edited.
  const effectiveSlug = useMemo(() => {
    if (slugTouched) return slug;
    const source = title[language] || title.en || title.fr || title.ar;
    return slugify(source);
  }, [slug, slugTouched, title, language]);

  const categoryOptions = categories.filter((c) => c.slug !== "all");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasText(title)) {
      setError(t("admin.validation.titleRequired"));
      return;
    }
    if (!category) {
      setError("Please choose a category.");
      return;
    }
    if (!effectiveSlug) {
      setError("Please enter a URL slug.");
      return;
    }

    const parsedYear = Number(year);
    await onSubmit({
      ...(initial ? { id: initial.id } : {}),
      slug: effectiveSlug,
      title: cleanI18n(title),
      category,
      location: cleanI18n(location),
      year: Number.isFinite(parsedYear) && parsedYear > 0 ? parsedYear : null,
      description: cleanI18n(description),
      services: selected,
      cover_path: cover || null,
      images,
      before_path: before || null,
      after_path: after || null,
      featured,
    });
  };

  const toggleService = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <form onSubmit={submit} className="space-y-5">
      <I18nField
        label={t("admin.fields.title")}
        value={title}
        onChange={setTitle}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t("admin.fields.slug")}
          value={effectiveSlug}
          onChange={(v) => {
            setSlug(v);
            setSlugTouched(true);
          }}
          placeholder="modern-apartment-interior"
          dir="ltr"
          required
        />
        <TextField
          label={t("admin.fields.year")}
          value={year}
          onChange={setYear}
          type="number"
          placeholder="2025"
          dir="ltr"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          {t("admin.fields.category")}
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        >
          <option value="">--</option>
          {categoryOptions.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name[language] || c.name.en}
            </option>
          ))}
        </select>
      </div>

      <I18nField
        label={t("admin.fields.location")}
        value={location}
        onChange={setLocation}
        required
      />

      <I18nField
        label={t("admin.fields.description")}
        value={description}
        onChange={setDescription}
        multiline
        rows={4}
      />

      {services.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium">
            {t("admin.fields.servicesProvided")}
          </label>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => {
              const on = selected.includes(s.value);
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleService(s.value)}
                  aria-pressed={on}
                  className={
                    on
                      ? "rounded-full border border-brand-red bg-brand-red/10 px-3 py-1.5 text-xs font-semibold text-brand-red"
                      : "rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-brand-red/40 hover:text-foreground"
                  }
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <SingleImagePicker
        label={t("admin.fields.coverImage")}
        value={cover}
        onChange={setCover}
        folder={category || "general"}
      />

      <SingleImagePicker
        label={t("admin.fields.before")}
        value={before}
        onChange={setBefore}
        folder={category || "general"}
      />

      <SingleImagePicker
        label={t("admin.fields.after")}
        value={after}
        onChange={setAfter}
        folder={category || "general"}
      />

      <CheckboxField
        label={t("admin.fields.featured")}
        checked={featured}
        onChange={setFeatured}
      />

      {errorNode}

      <FormActions
        onCancel={onCancel}
        loading={loading}
        saveLabel={t("admin.actions.save")}
      />
    </form>
  );
}

/* ------------------------------------------------------------------ *
 * Category
 * ------------------------------------------------------------------ */

export function CategoryForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: Category;
  onSubmit: Submit;
  onCancel: () => void;
  loading?: boolean;
}) {
  const { t } = useLanguage();
  const { setError, node: errorNode } = useFormError();

  const [name, setName] = useState<I18nText>(from(initial?.name));
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [description, setDescription] = useState<I18nText>(
    from(initial?.description),
  );

  const effectiveSlug = useMemo(() => {
    if (slugTouched) return slug;
    const source = name.en || name.fr || name.ar;
    return slugify(source);
  }, [slug, slugTouched, name]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasText(name)) {
      setError(t("admin.validation.nameRequired"));
      return;
    }
    if (!effectiveSlug) {
      setError("Please enter a URL slug.");
      return;
    }

    await onSubmit({
      ...(initial ? { id: initial.id } : {}),
      slug: effectiveSlug,
      name: cleanI18n(name),
      description: cleanI18n(description),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <I18nField
        label={t("admin.fields.name")}
        value={name}
        onChange={setName}
        required
      />

      <TextField
        label={t("admin.fields.slug")}
        value={effectiveSlug}
        onChange={(v) => {
          setSlug(v);
          setSlugTouched(true);
        }}
        placeholder="drywall"
        dir="ltr"
        required
      />

      <I18nField
        label={t("admin.fields.description")}
        value={description}
        onChange={setDescription}
        multiline
      />

      {errorNode}

      <FormActions
        onCancel={onCancel}
        loading={loading}
        saveLabel={t("admin.actions.save")}
      />
    </form>
  );
}

/* ------------------------------------------------------------------ *
 * Service
 * ------------------------------------------------------------------ */

const ICON_CHOICES = [
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

export function ServiceForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: ServiceItem;
  onSubmit: Submit;
  onCancel: () => void;
  loading?: boolean;
}) {
  const { t } = useLanguage();
  const { setError, node: errorNode } = useFormError();

  const [name, setName] = useState<I18nText>(from(initial?.name));
  const [description, setDescription] = useState<I18nText>(
    from(initial?.description),
  );
  const [icon, setIcon] = useState(initial?.icon ?? "Layers");
  const [startingPrice, setStartingPrice] = useState(
    initial?.startingPrice != null ? String(initial.startingPrice) : "",
  );
  const [unit, setUnit] = useState<I18nText>(from(initial?.unit));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasText(name)) {
      setError(t("admin.validation.serviceRequired"));
      return;
    }

    const price = startingPrice.trim() === "" ? null : Number(startingPrice);
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      setError("Starting price must be zero or more.");
      return;
    }

    await onSubmit({
      ...(initial ? { id: initial.id } : {}),
      name: cleanI18n(name),
      description: cleanI18n(description),
      icon,
      starting_price: price,
      unit: cleanI18n(unit),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <I18nField
        label={t("admin.fields.name")}
        value={name}
        onChange={setName}
        required
      />

      <I18nField
        label={t("admin.fields.description")}
        value={description}
        onChange={setDescription}
        multiline
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium">
            {t("admin.fields.icon")}
          </label>
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className={inputClass}
          >
            {ICON_CHOICES.map((name_) => (
              <option key={name_} value={name_}>
                {name_}
              </option>
            ))}
          </select>
        </div>

        <TextField
          label={t("admin.fields.startingPrice")}
          value={startingPrice}
          onChange={setStartingPrice}
          type="number"
          placeholder="1800"
          dir="ltr"
        />
      </div>

      <I18nField
        label={t("admin.fields.unit")}
        value={unit}
        onChange={setUnit}
      />

      {errorNode}

      <FormActions
        onCancel={onCancel}
        loading={loading}
        saveLabel={t("admin.actions.save")}
      />
    </form>
  );
}

/* ------------------------------------------------------------------ *
 * Price
 * ------------------------------------------------------------------ */

export function PriceForm({
  initial,
  categories,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: Price;
  categories: Category[];
  onSubmit: Submit;
  onCancel: () => void;
  loading?: boolean;
}) {
  const { t, language } = useLanguage();
  const { setError, node: errorNode } = useFormError();

  const [service, setService] = useState<I18nText>(from(initial?.service));
  const [description, setDescription] = useState<I18nText>(
    from(initial?.description),
  );
  const [unit, setUnit] = useState<I18nText>(from(initial?.unit));
  const [category, setCategory] = useState(initial?.category ?? "");
  const [priceFrom, setPriceFrom] = useState(
    initial ? String(initial.priceFrom) : "",
  );
  const [priceTo, setPriceTo] = useState(
    initial?.priceTo != null ? String(initial.priceTo) : "",
  );
  const [currency, setCurrency] = useState(initial?.currency ?? "DZD");
  const [notes, setNotes] = useState<I18nText>(from(initial?.notes));

  const categoryOptions = categories.filter((c) => c.slug !== "all");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasText(service)) {
      setError(t("admin.validation.serviceRequired"));
      return;
    }

    const from = Number(priceFrom);
    if (priceFrom.trim() === "" || !Number.isFinite(from) || from < 0) {
      setError("Please enter a starting price of zero or more.");
      return;
    }

    const to = priceTo.trim() === "" ? null : Number(priceTo);
    if (to !== null && (!Number.isFinite(to) || to < 0)) {
      setError('"Price up to" cannot be negative.');
      return;
    }
    if (to !== null && to < from) {
      setError(t("admin.validation.priceToLessThanFrom"));
      return;
    }

    await onSubmit({
      ...(initial ? { id: initial.id } : {}),
      service: cleanI18n(service),
      description: cleanI18n(description),
      unit: cleanI18n(unit),
      category: category || null,
      price_from: from,
      price_to: to,
      currency: currency.trim() || "DZD",
      notes: cleanI18n(notes),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <I18nField
        label={t("admin.fields.service")}
        value={service}
        onChange={setService}
        required
      />

      <I18nField
        label={t("admin.fields.description")}
        value={description}
        onChange={setDescription}
        multiline
      />

      <div>
        <label className="block text-sm font-medium mb-1.5">
          {t("admin.fields.category")}
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        >
          <option value="">--</option>
          {categoryOptions.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name[language] || c.name.en}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label={t("admin.fields.priceFrom")}
          value={priceFrom}
          onChange={setPriceFrom}
          type="number"
          placeholder="1800"
          dir="ltr"
          required
        />
        <TextField
          label={t("admin.fields.priceTo")}
          value={priceTo}
          onChange={setPriceTo}
          type="number"
          placeholder="3000"
          dir="ltr"
        />
        <TextField
          label={t("admin.fields.currency")}
          value={currency}
          onChange={setCurrency}
          dir="ltr"
        />
      </div>

      <I18nField label={t("admin.fields.unit")} value={unit} onChange={setUnit} />

      <I18nField
        label={t("admin.fields.notes")}
        value={notes}
        onChange={setNotes}
        multiline
      />

      {errorNode}

      <FormActions
        onCancel={onCancel}
        loading={loading}
        saveLabel={t("admin.actions.save")}
      />
    </form>
  );
}

/* ------------------------------------------------------------------ *
 * Site Text
 * ------------------------------------------------------------------ */

export function SiteTextForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: { id?: string; key: string; value?: Partial<I18nText> };
  onSubmit: Submit;
  onCancel: () => void;
  loading?: boolean;
}) {
  const { t } = useLanguage();
  const { setError, node: errorNode } = useFormError();

  const [key, setKey] = useState(initial?.key ?? "");
  const [value, setValue] = useState<I18nText>(from(initial?.value));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!key.trim()) {
      setError("Key is required.");
      return;
    }
    if (!hasText(value)) {
      setError(t("admin.validation.titleRequired"));
      return;
    }
    await onSubmit({
      ...(initial ? { id: (initial as any).id } : {}),
      key: key.trim(),
      value: cleanI18n(value),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <TextField
        label="Key"
        value={key}
        onChange={setKey}
        required
        dir="ltr"
        hint="Hero on the homepage reads hero.headline, hero.subheadline, hero.primaryCta, hero.secondaryCta, hero.location. Other keys are stored for future use."
      />
      <I18nField
        label={t("admin.fields.value")}
        value={value}
        onChange={setValue}
        multiline
      />
      {errorNode}
      <FormActions
        onCancel={onCancel}
        loading={loading}
        saveLabel={t("admin.actions.save")}
      />
    </form>
  );
}

/* ------------------------------------------------------------------ *
 * Setting
 * ------------------------------------------------------------------ */

export function SettingForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: { id?: string; key: string; value: Record<string, unknown> };
  onSubmit: Submit;
  onCancel: () => void;
  loading?: boolean;
}) {
  const { t } = useLanguage();
  const { setError, node: errorNode } = useFormError();

  const [key, setKey] = useState(initial?.key ?? "");
  const [value, setValue] = useState(
    initial?.value ? JSON.stringify(initial.value, null, 2) : "{}",
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!key.trim()) {
      setError("Key is required.");
      return;
    }
    try {
      const parsed = JSON.parse(value);
      await onSubmit({
        ...(initial ? { id: (initial as any).id } : {}),
        key: key.trim(),
        value: parsed,
      });
    } catch {
      setError("Invalid JSON in value.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <TextField label="Key" value={key} onChange={setKey} required dir="ltr" />
      <TextAreaField
        label={t("admin.fields.value")}
        value={value}
        onChange={setValue}
        rows={8}
        dir="ltr"
      />
      {errorNode}
      <FormActions
        onCancel={onCancel}
        loading={loading}
        saveLabel={t("admin.actions.save")}
      />
    </form>
  );
}

/* ------------------------------------------------------------------ *
 * Testimonial
 * ------------------------------------------------------------------ */

export function TestimonialForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: Testimonial;
  onSubmit: Submit;
  onCancel: () => void;
  loading?: boolean;
}) {
  const { t } = useLanguage();
  const { setError, node: errorNode } = useFormError();

  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    initial?.status ?? "approved",
  );
  const [project, setProject] = useState(initial?.project ?? "");
  const [review, setReview] = useState<I18nText>(from(initial?.review));
  const [rating, setRating] = useState(
    initial?.rating ? String(initial.rating) : "",
  );
  const [date, setDate] = useState(initial?.date ?? "");
  const [isPlaceholder, setIsPlaceholder] = useState(
    initial?.isPlaceholder ?? false,
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t("admin.validation.nameRequired"));
      return;
    }
    if (!hasText(review)) {
      setError(t("admin.validation.titleRequired"));
      return;
    }
    const parsedRating = rating.trim() === "" ? null : Number(rating);
    if (parsedRating !== null && (parsedRating < 1 || parsedRating > 5)) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    await onSubmit({
      ...(initial ? { id: initial.id } : {}),
      name: name.trim(),
      phone: phone.trim() || null,
      status,
      project: project.trim(),
      review: cleanI18n(review),
      rating: parsedRating,
      review_date: date,
      is_placeholder: isPlaceholder,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t("admin.fields.name")}
          value={name}
          onChange={setName}
          placeholder="Houari B."
          required
        />
        <TextField
          label={t("admin.fields.project")}
          value={project}
          onChange={setProject}
          placeholder="Bab Ezzouar apartment"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Phone Number (Private Verification)"
          value={phone}
          onChange={setPhone}
          placeholder="06 XX XX XX XX"
          dir="ltr"
          hint="Only for admin verification. Never shown on website."
        />
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Approval Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className={inputClass}
          >
            <option value="approved">Approved (Public)</option>
            <option value="pending">Pending Approval (Hidden)</option>
            <option value="rejected">Rejected (Hidden)</option>
          </select>
        </div>
      </div>

      <I18nField
        label={t("admin.fields.review")}
        value={review}
        onChange={setReview}
        multiline
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t("admin.fields.rating")}
          value={rating}
          onChange={setRating}
          type="number"
          placeholder="5"
          dir="ltr"
        />
        <TextField
          label={t("admin.fields.date")}
          value={date}
          onChange={setDate}
          type="date"
          dir="ltr"
        />
      </div>

      <CheckboxField
        label={t("admin.fields.placeholder")}
        checked={isPlaceholder}
        onChange={setIsPlaceholder}
      />

      {errorNode}

      <FormActions
        onCancel={onCancel}
        loading={loading}
        saveLabel={t("admin.actions.save")}
      />
    </form>
  );
}