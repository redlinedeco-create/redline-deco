"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/media";
import { AdminUpload, type MediaItem } from "@/lib/adminApi";
import { useLanguage } from "@/lib/providers/LanguageProvider";

/* ------------------------------------------------------------------ *
 * Layout primitives
 * ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium">
        {label}
        {required && <span className="text-brand-red ms-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 disabled:opacity-60";

export const textareaClass = `${inputClass} min-h-24 resize-y leading-relaxed`;

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  hint,
  type = "text",
  dir,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  type?: string;
  dir?: "ltr" | "rtl";
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} required={required} className={className}>
      <input
        type={type}
        dir={dir}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  dir?: "ltr" | "rtl";
}) {
  return (
    <Field label={label}>
      <textarea
        dir={dir}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={textareaClass}
      />
    </Field>
  );
}

const LANGS = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
] as const;

type Lang = (typeof LANGS)[number]["code"];
export type I18nText = Record<Lang, string>;

/**
 * Three inputs, one per language. Only English is required -- a translation can
 * be added later without blocking the save.
 */
export function I18nField({
  label,
  value,
  onChange,
  multiline,
  required,
  rows,
  dirFor,
}: {
  label: string;
  value: I18nText;
  onChange: (value: I18nText) => void;
  multiline?: boolean;
  required?: boolean;
  rows?: number;
  /** Lets Arabic fields render right-to-left. */
  dirFor?: (lang: Lang) => "ltr" | "rtl";
}) {
  const [tab, setTab] = useState<Lang>("en");

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-medium">
          {label}
          {required && <span className="text-brand-red ms-1">*</span>}
        </label>
        <div
          className="inline-flex rounded-lg border border-border p-0.5"
          role="tablist"
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              role="tab"
              aria-selected={tab === l.code}
              onClick={() => setTab(l.code)}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors",
                tab === l.code
                  ? "bg-brand-red text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {LANGS.map((l) =>
        l.code === tab ? (
          multiline ? (
            <textarea
              key={l.code}
              dir={dirFor?.(l.code) ?? (l.code === "ar" ? "rtl" : "ltr")}
              rows={rows ?? 3}
              value={value[l.code] ?? ""}
              onChange={(e) => onChange({ ...value, [l.code]: e.target.value })}
              className={textareaClass}
            />
          ) : (
            <input
              key={l.code}
              dir={dirFor?.(l.code) ?? (l.code === "ar" ? "rtl" : "ltr")}
              value={value[l.code] ?? ""}
              onChange={(e) => onChange({ ...value, [l.code]: e.target.value })}
              className={inputClass}
            />
          )
        ) : null,
      )}
    </div>
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border accent-brand-red"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

export function FormActions({
  onCancel,
  loading,
  saveLabel,
}: {
  onCancel: () => void;
  loading?: boolean;
  saveLabel: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {saveLabel}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Image pickers
 * ------------------------------------------------------------------ */

function Thumb({
  path,
  onRemove,
  onUseCover,
  isCover,
  removeLabel,
}: {
  path: string;
  onRemove: () => void;
  onUseCover?: () => void;
  isCover?: boolean;
  removeLabel: string;
}) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/40">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mediaUrl(path)}
        alt={path.split("/").pop() ?? ""}
        loading="lazy"
        className="h-full w-full object-cover"
      />

      {isCover && (
        <span className="absolute top-1 start-1 inline-flex items-center gap-1 rounded bg-brand-red px-1.5 py-0.5 text-[10px] font-bold text-white">
          <Star className="h-2.5 w-2.5 fill-current" />
        </span>
      )}

      <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {onUseCover && !isCover && (
          <button
            type="button"
            onClick={onUseCover}
            title="Use as cover"
            className="h-7 w-7 grid place-items-center rounded bg-white/90 text-neutral-900 transition-colors hover:bg-white"
          >
            <Star className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          title={removeLabel}
          aria-label={removeLabel}
          className="h-7 w-7 grid place-items-center rounded bg-white/90 text-red-600 transition-colors hover:bg-white"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/** Browse the existing media library and append paths to the value. */
function LibraryPicker({
  folder,
  onPick,
  onClose,
}: {
  folder: string;
  onPick: (path: string) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    AdminUpload.list()
      .then((media) => {
        if (!cancelled) setItems(media);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const shown = (items ?? []).filter((m) => m.folder === folder);

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("admin.upload.library")}
        className="relative z-10 w-full max-w-4xl max-h-[80vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <h3 className="font-bold">{t("admin.upload.library")}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {error && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          )}
          {items === null && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-lg bg-muted/60"
                />
              ))}
            </div>
          )}
          {items !== null && shown.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No images in the library yet. Upload some first.
            </p>
          )}

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
            {shown.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onPick(m.path);
                  onClose();
                }}
                title={m.filename}
                className="aspect-square overflow-hidden rounded-lg border border-border bg-muted/40 transition-colors hover:border-brand-red"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(m.path)}
                  alt={m.filename}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function useUploader(folder: string) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return [] as string[];
      setBusy(true);
      setError(null);
      try {
        const { media, errors } = await AdminUpload.upload(files, folder);
        if (errors.length) setError(errors.join("; "));
        return media.map((m) => m.path);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed.");
        return [];
      } finally {
        setBusy(false);
      }
    },
    [folder],
  );

  return { busy, error, upload, inputRef };
}

/**
 * Ordered list of images for a project gallery. Supports uploading new files,
 * picking from the library, reordering and promoting the first image to cover.
 */
export function MultiImagePicker({
  label,
  value,
  onChange,
  folder = "general",
  onRemove,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (paths: string[]) => void;
  folder?: string;
  onRemove?: (path: string) => Promise<void>;
  hint?: string;
}) {
  const { t } = useLanguage();
  const { busy, error, upload, inputRef } = useUploader(folder);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const move = (index: number, delta: number) => {
    const next = [...value];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const pickFiles = async (list: FileList | null) => {
    if (!list) return;
    const paths = await upload(Array.from(list));
    if (paths.length) onChange([...value, ...paths]);
  };

  const drop = (e: React.DragEvent) => {
    e.preventDefault();
    void pickFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-medium">{label}</label>
        <span className="text-xs text-muted-foreground">{value.length}</span>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={drop}
        className="rounded-lg border-2 border-dashed border-border p-3 transition-colors hover:border-brand-red/50"
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {t("admin.upload.clickOrDrag")}
          </button>

          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ImagePlus className="h-4 w-4" />
            {t("admin.upload.library")}
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          multiple
          hidden
          onChange={(e) => {
            void pickFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {error && (
          <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        )}

        {value.length === 0 ? (
          <p className="mt-3 text-center text-xs text-muted-foreground py-4">
            {t("admin.upload.clickOrDrag")}
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
            {value.map((path, i) => (
              <div key={`${path}-${i}`} className="relative group">
                <Thumb
                  path={path}
                  isCover={i === 0}
                  removeLabel="Remove"
                  onRemove={() => {
                    const next = value.filter((_, idx) => idx !== i);
                    onChange(next);
                    if (onRemove) void onRemove(path);
                  }}
                />
                <div className="absolute bottom-1 start-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move earlier"
                    className="h-5 w-5 grid place-items-center rounded bg-white/90 text-neutral-900 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3 w-3 rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === value.length - 1}
                    aria-label="Move later"
                    className="h-5 w-5 grid place-items-center rounded bg-white/90 text-neutral-900 disabled:opacity-40"
                  >
                    <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      {libraryOpen && (
        <LibraryPicker
          folder={folder}
          onClose={() => setLibraryOpen(false)}
          onPick={(path) => {
            if (!value.includes(path)) onChange([...value, path]);
          }}
        />
      )}
    </div>
  );
}

/** One image: cover photo, or a before/after frame. */
export function SingleImagePicker({
  label,
  value,
  onChange,
  folder = "general",
  onRemove,
}: {
  label: string;
  value: string;
  onChange: (path: string) => void;
  folder?: string;
  onRemove?: (path: string) => Promise<void>;
}) {
  const { t } = useLanguage();
  const { busy, error, upload, inputRef } = useUploader(folder);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const pickFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const paths = await upload([list[0]]);
    if (paths[0]) onChange(paths[0]);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">{label}</label>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        hidden
        onChange={(e) => {
          void pickFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaUrl(value)}
            alt={label}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="h-7 w-7 grid place-items-center rounded bg-white/90 text-neutral-900 disabled:opacity-60"
              aria-label={t("admin.upload.replace")}
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className="h-7 w-7 grid place-items-center rounded bg-white/90 text-neutral-900"
              aria-label={t("admin.upload.library")}
            >
              <ImagePlus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const old = value;
                onChange("");
                if (onRemove) void onRemove(old);
              }}
              className="h-7 w-7 grid place-items-center rounded bg-white/90 text-red-600"
              aria-label="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          onDrop={(e) => {
            e.preventDefault();
            void pickFiles(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
          className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-brand-red/50 hover:text-foreground disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
          {t("admin.upload.clickOrDrag")}
        </button>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      {libraryOpen && (
        <LibraryPicker
          folder={folder}
          onClose={() => setLibraryOpen(false)}
          onPick={(path) => onChange(path)}
        />
      )}
    </div>
  );
}