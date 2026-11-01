"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";

import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";
import { AdminRequests as inbox, type ContactRequestRow } from "@/lib/adminApi";
import { REQUEST_STATUSES } from "@/lib/quote";

const FILTERS = ["all", ...REQUEST_STATUSES] as const;

const STATUS_STYLES: Record<string, string> = {
  new: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  in_progress: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  won: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  lost: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
  spam: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function formatDate(iso: string, language: string) {
  try {
    return new Date(iso).toLocaleString(
      language === "ar" ? "ar-DZ" : language,
      { dateStyle: "medium", timeStyle: "short" },
    );
  } catch {
    return iso;
  }
}

function whatsappHref(phone: string) {
  return `https://wa.me/${phone.replace(/[^\d]/g, "")}`;
}

export function AdminRequests({
  onNewCount,
}: {
  onNewCount?: (count: number) => void;
}) {
  const { t, language } = useLanguage();

  const [rows, setRows] = useState<ContactRequestRow[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<
    { kind: "success" | "error"; text: string } | null
  >(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const flash = useCallback((kind: "success" | "error", text: string) => {
    setNotice({ kind, text });
    setTimeout(() => setNotice(null), 4000);
  }, []);

  const publishCount = useCallback(
    (count: number) => {
      setNewCount(count);
      onNewCount?.(count);
    },
    [onNewCount],
  );

  const load = useCallback(
    async (status: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await inbox.list(status);
        setRows(result.requests);
        publishCount(result.newCount);
        setDrafts(
          Object.fromEntries(
            result.requests.map((row) => [row.id, row.admin_note ?? ""]),
          ),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : t("admin.requests.loadError"));
      } finally {
        setLoading(false);
      }
    },
    [publishCount, t],
  );

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  function withRow(id: string, patch: Partial<ContactRequestRow>) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function countDelta(from: string | null, to: string | null) {
    const delta = (from === "new" ? 1 : 0) - (to === "new" ? 1 : 0);
    if (delta) publishCount(Math.max(0, newCount + delta));
  }

  async function changeStatus(row: ContactRequestRow, status: string) {
    setBusyId(row.id);
    try {
      const updated = await inbox.update(row.id, { status });
      countDelta(row.status, status);
      setPendingDelete(null);

      if (filter !== "all" && filter !== status) {
        setRows((prev) => prev.filter((r) => r.id !== row.id));
      } else {
        withRow(row.id, updated);
      }
      flash("success", t("admin.requests.saved"));
    } catch (e) {
      flash("error", e instanceof Error ? e.message : t("admin.requests.saveError"));
    } finally {
      setBusyId(null);
    }
  }

  async function saveNote(row: ContactRequestRow) {
    setBusyId(row.id);
    try {
      const updated = await inbox.update(row.id, {
        admin_note: drafts[row.id] ?? "",
      });
      withRow(row.id, { ...updated, admin_note: updated.admin_note });
      flash("success", t("admin.requests.saved"));
    } catch (e) {
      flash("error", e instanceof Error ? e.message : t("admin.requests.saveError"));
    } finally {
      setBusyId(null);
    }
  }

  async function deleteRow(row: ContactRequestRow) {
    setBusyId(row.id);
    try {
      const res = await inbox.remove(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      countDelta(row.status, null);
      setPendingDelete(null);
      if (res.warning) flash("error", res.warning);
      else flash("success", t("admin.requests.deleted"));
    } catch (e) {
      flash("error", e instanceof Error ? e.message : t("admin.requests.deleteError"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-baseline gap-3">
          <h2 className="font-bold text-xl">{t("admin.sections.requests")}</h2>
          {newCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-bold text-sky-600 dark:text-sky-400">
              {newCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => load(filter)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted disabled:opacity-60"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          {t("admin.requests.refresh")}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors",
              filter === key
                ? "border-brand-red bg-brand-red text-white"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {t(`admin.requests.filters.${key}`)}
          </button>
        ))}
      </div>

      {notice && (
        <div
          className={cn(
            "mb-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm",
            notice.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200",
          )}
        >
          {notice.kind === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center rounded-xl border border-border bg-card py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mb-3" />
          <span className="text-sm">{t("common.loading")}</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center text-sm text-muted-foreground">
          {t("admin.requests.empty")}
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <article
              key={row.id}
              className="rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-red">
                      {row.reference}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {t(`admin.requests.source.${row.source}`)}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                        STATUS_STYLES[row.status] ?? STATUS_STYLES.new,
                      )}
                    >
                      {t(`admin.requests.status.${row.status}`)}
                    </span>
                  </div>
                  <h3 className="mt-2 font-bold text-lg leading-tight">
                    {row.name}
                    {row.subject && (
                      <span className="font-normal text-muted-foreground">
                        {" — "}
                        {row.subject}
                      </span>
                    )}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(row.created_at, language)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={row.status}
                    disabled={busyId === row.id}
                    onChange={(e) => changeStatus(row, e.target.value)}
                    aria-label={t("admin.requests.statusLabel")}
                    className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-red disabled:opacity-60"
                  >
                    {REQUEST_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {t(`admin.requests.status.${status}`)}
                      </option>
                    ))}
                  </select>
                  {pendingDelete === row.id ? (
                    <button
                      type="button"
                      onClick={() => deleteRow(row)}
                      disabled={busyId === row.id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                    >
                      {busyId === row.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      {t("admin.requests.confirmDelete")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingDelete(row.id)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t("admin.actions.delete")}
                    </button>
                  )}
                </div>
              </header>

              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`mailto:${row.email}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                >
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {row.email}
                </a>
                {row.phone && (
                  <>
                    <a
                      href={`tel:${row.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {row.phone}
                    </a>
                    <a
                      href={whatsappHref(row.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-2.5 py-1.5 text-xs font-semibold text-white transition-all hover:brightness-105"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {t("contact.buttons.whatsapp")}
                    </a>
                  </>
                )}
              </div>

              <p className="mt-4 whitespace-pre-wrap rounded-lg border border-border bg-background p-3 text-sm">
                {row.description}
              </p>

              {(row.location ||
                row.project_type ||
                row.service ||
                row.area ||
                row.budget ||
                row.preferred_date) && (
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 text-xs">
                  {row.location && (
                    <Meta label={t("quote.fields.location")} value={row.location} />
                  )}
                  {row.project_type && (
                    <Meta
                      label={t("quote.fields.projectType")}
                      value={t(`quote.fields.types.${row.project_type}`)}
                    />
                  )}
                  {row.service && (
                    <Meta label={t("quote.fields.service")} value={row.service} />
                  )}
                  {row.area && (
                    <Meta label={t("quote.fields.area")} value={row.area} />
                  )}
                  {row.budget && (
                    <Meta label={t("quote.fields.budget")} value={row.budget} />
                  )}
                  {row.preferred_date && (
                    <Meta
                      label={t("quote.fields.date")}
                      value={row.preferred_date}
                    />
                  )}
                </dl>
              )}

              {(row.photos.length > 0 || row.documents.length > 0) && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("admin.requests.attachments")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {row.photos.map((file) => (
                      <Attachment key={file.path} file={file} icon={ImageIcon} />
                    ))}
                    {row.documents.map((file) => (
                      <Attachment key={file.path} file={file} icon={FileText} />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 border-t border-border pt-3">
                <label
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  htmlFor={`note-${row.id}`}
                >
                  {t("admin.requests.note")}
                </label>
                <textarea
                  id={`note-${row.id}`}
                  rows={2}
                  value={drafts[row.id] ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [row.id]: e.target.value }))
                  }
                  placeholder={t("admin.requests.notePlaceholder")}
                  className="mt-1.5 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-muted-foreground">
                    {t("admin.requests.noteHint")}
                  </span>
                  <button
                    type="button"
                    onClick={() => saveNote(row)}
                    disabled={
                      busyId === row.id || (drafts[row.id] ?? "") === (row.admin_note ?? "")
                    }
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand-red px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {busyId === row.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {t("admin.actions.save")}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground break-words">{value}</dd>
    </div>
  );
}

function Attachment({
  file,
  icon: Icon,
}: {
  file: { path: string; name: string; url: string | null };
  icon: any;
}) {
  const inner = (
    <>
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="max-w-[10rem] truncate">{file.name}</span>
    </>
  );

  return file.url ? (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
    >
      {inner}
    </a>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
      {inner}
    </span>
  );
}
