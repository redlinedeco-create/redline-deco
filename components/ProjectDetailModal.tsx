"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X, MapPin, Calendar, ArrowRight, Tag } from "lucide-react";
import type { Category, Project, ServiceItem } from "@/types";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { BeforeAfter } from "./BeforeAfter";
import { ProjectGallery } from "./ProjectGallery";
import { cn } from "@/lib/utils";

export function ProjectDetailModal({
  project,
  onClose,
  categories,
  services,
}: {
  project: Project | null;
  onClose: () => void;
  categories?: Category[];
  services?: ServiceItem[];
}) {
  const { t, language, dir } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (project) {
      setMounted(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [project]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!project && !mounted) return null;

  const p = project;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!project}
      className={cn(
        "fixed inset-0 z-[60] flex items-end sm:items-center justify-center",
        project ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300",
          project ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "relative z-10 w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border transition-all duration-300",
          project ? "translate-y-0 opacity-100" : "translate-y-8 sm:translate-y-4 opacity-0",
        )}
      >
        {p && (
          <>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.close")}
              className="absolute top-3 end-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur text-white hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src={p.coverImage}
                alt={p.title[language] ?? p.title.en}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            <div className="px-5 sm:px-8 py-6 sm:py-8">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-brand-red" />
                  {(categories?.find((c) => c.slug === p.category)?.name[language]) ??
                    p.category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-brand-red" />
                  {p.location[language] ?? p.location.en}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-brand-red" />
                  {p.year}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                {p.title[language] ?? p.title.en}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {p.description[language] ?? p.description.en}
              </p>

              {p.services.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">
                    {t("portfolio.project.services")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {p.services.map((slug) => {
                      const s = (services ?? []).find((x) => x.id === `svc-${slug}`) ||
                        (services ?? []).find((x) => x.icon === slug);
                      const label = s
                        ? s.name[language] ?? s.name.en
                        : slug;
                      return (
                        <span
                          key={slug}
                          className="inline-flex items-center rounded-full bg-brand-red/10 text-brand-red px-3 py-1 text-xs font-semibold border border-brand-red/20"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {p.beforeImage && p.afterImage && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
                    {t("portfolio.project.beforeAfter")}
                  </h3>
                  <BeforeAfter before={p.beforeImage} after={p.afterImage} />
                </div>
              )}

              {p.images.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
                    {t("portfolio.project.gallery")}
                  </h3>
                  <ProjectGallery images={p.images} projectTitle={p.title[language] ?? p.title.en} />
                </div>
              )}

              <div className="mt-10 rounded-xl border border-brand-red/30 bg-brand-red/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-lg text-foreground">
                    {t("portfolio.project.cta")}
                  </p>
                </div>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-md bg-brand-red text-white px-5 py-3 font-semibold shadow hover:bg-brand-red-600 transition-colors"
                >
                  {t("nav.quote")}
                  <ArrowRight className={cn("h-4 w-4", dir === "rtl" && "scale-x-[-1]")} />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
