"use client";

import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  Upload,
  AlertTriangle,
  FileText,
  Layers,
  PaintBucket,
  Tag,
} from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { projects } from "@/data/projects";
import { categories } from "@/data/categories";
import { services } from "@/data/services";
import { pricing } from "@/data/pricing";
import { cn } from "@/lib/utils";

const tabs = ["projects", "categories", "services", "prices", "uploads"] as const;
const tabIcons: Record<(typeof tabs)[number], any> = {
  projects: FileText,
  categories: Tag,
  services: Layers,
  prices: PaintBucket,
  uploads: Upload,
};

export function AdminDashboard() {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState<(typeof tabs)[number]>("projects");

  return (
    <section className="py-10 lg:py-14">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          role="alert"
          className="mb-8 rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40 p-5 flex items-start gap-4"
        >
          <div className="h-11 w-11 shrink-0 grid place-items-center rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-red-700 dark:text-red-300 mb-1">
              {t("admin.disclaimer").split("—")[0]} —
            </h3>
            <p className="text-red-700/90 dark:text-red-200/80 text-sm leading-relaxed">
              {t("admin.disclaimer")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-border pb-2">
          {tabs.map((k) => {
            const Icon = tabIcons[k];
            const active = tab === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-t-md text-sm font-semibold border-b-2 transition-colors mb-[-2px]",
                  active
                    ? "text-brand-red border-brand-red bg-brand-red/5"
                    : "text-muted-foreground border-transparent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {t(`admin.sections.${k}`)}
              </button>
            );
          })}
        </div>

        {tab === "projects" && <AdminProjects />}
        {tab === "categories" && <AdminCategories />}
        {tab === "services" && <AdminServices />}
        {tab === "prices" && <AdminPrices />}
        {tab === "uploads" && <AdminUploads />}
      </div>
    </section>
  );
}

function AdminBar({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-bold text-xl">{title}</h2>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md bg-brand-red text-white px-4 py-2 text-sm font-semibold hover:bg-brand-red-600 transition-colors"
      >
        <Plus className="h-4 w-4" /> Add
      </button>
    </div>
  );
}

function AdminProjects() {
  const { t, language } = useLanguage();
  return (
    <div>
      <AdminBar title={t("admin.sections.projects") + ` (${projects.length})`} />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-start px-4 py-3 font-semibold">Project</th>
                <th className="text-start px-4 py-3 font-semibold hidden md:table-cell">Category</th>
                <th className="text-start px-4 py-3 font-semibold hidden sm:table-cell">Location</th>
                <th className="text-start px-4 py-3 font-semibold hidden lg:table-cell">Year</th>
                <th className="text-start px-4 py-3 font-semibold">Featured</th>
                <th className="text-end px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p.title[language] ?? p.title.en}</td>
                  <td className="px-4 py-3 hidden md:table-cell capitalize">{p.category}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    {p.location[language] ?? p.location.en}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{p.year}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      aria-pressed={p.featured}
                      className={cn(
                        "h-8 w-8 rounded-md inline-flex items-center justify-center",
                        p.featured ? "text-amber-500" : "text-muted-foreground",
                      )}
                    >
                      <Star className="h-4 w-4" fill={p.featured ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton Icon={Edit2} />
                      <IconButton Icon={Trash2} danger />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminCategories() {
  const { t, language } = useLanguage();
  const cats = categories.filter((c) => c.slug !== "all");
  return (
    <div>
      <AdminBar title={t("admin.sections.categories") + ` (${cats.length})`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-border bg-card p-5 flex items-start justify-between gap-4"
          >
            <div>
              <div className="font-semibold">{c.name[language] ?? c.name.en}</div>
              <div className="text-xs text-muted-foreground mt-1">/{c.slug}</div>
            </div>
            <div className="flex items-center gap-1">
              <IconButton Icon={Edit2} />
              <IconButton Icon={Trash2} danger />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminServices() {
  const { t, language } = useLanguage();
  return (
    <div>
      <AdminBar title={t("admin.sections.services") + ` (${services.length})`} />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-start px-4 py-3 font-semibold">Service</th>
                <th className="text-start px-4 py-3 font-semibold hidden md:table-cell">Icon</th>
                <th className="text-start px-4 py-3 font-semibold hidden lg:table-cell">Starting Price</th>
                <th className="text-end px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    {s.name[language] ?? s.name.en}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{s.icon}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {s.startingPrice ? `${s.startingPrice.toLocaleString()} DZD / ${s.unit ?? "-"}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton Icon={Edit2} />
                      <IconButton Icon={Trash2} danger />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminPrices() {
  const { t, language } = useLanguage();
  return (
    <div>
      <AdminBar title={t("admin.sections.prices") + ` (${pricing.length})`} />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-start px-4 py-3 font-semibold">Service</th>
                <th className="text-start px-4 py-3 font-semibold hidden md:table-cell">Category</th>
                <th className="text-start px-4 py-3 font-semibold">Range</th>
                <th className="text-start px-4 py-3 font-semibold hidden sm:table-cell">Unit</th>
                <th className="text-start px-4 py-3 font-semibold hidden lg:table-cell">Updated</th>
                <th className="text-end px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pricing.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p.service[language] ?? p.service.en}</td>
                  <td className="px-4 py-3 capitalize hidden md:table-cell text-muted-foreground">
                    {p.category}
                  </td>
                  <td className="px-4 py-3 text-brand-red font-semibold whitespace-nowrap">
                    {p.priceFrom.toLocaleString()}
                    {p.priceTo ? ` – ${p.priceTo.toLocaleString()}` : ""} {p.currency}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    {p.unit[language] ?? p.unit.en}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {p.updatedAt}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton Icon={Edit2} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminUploads() {
  const { t } = useLanguage();
  return (
    <div>
      <AdminBar title={t("admin.sections.uploads")} />
      <div className="rounded-xl border-2 border-dashed border-border bg-card p-10 text-center">
        <div className="mx-auto mb-4 h-14 w-14 grid place-items-center rounded-full bg-brand-red/10 text-brand-red">
          <Upload className="h-7 w-7" />
        </div>
        <h3 className="font-bold text-lg mb-1">Upload Project Images</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Drag & drop or click to browse. Supports JPG, PNG, WebP.
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Upload className="h-4 w-4" /> Browse Files
        </button>
      </div>
    </div>
  );
}

function IconButton({
  Icon,
  danger,
}: {
  Icon: any;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label="action"
      className={cn(
        "h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-background transition-colors",
        danger
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
