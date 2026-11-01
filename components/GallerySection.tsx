"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";
import type { Category, Project } from "@/types";

const CAP_ALL = 48;
const CAP_FILTERED = 24;

/** Evenly samples `count` entries so every project is represented. */
function sample<T>(list: T[], count: number): T[] {
  if (list.length <= count) return list;
  const step = list.length / count;
  return Array.from({ length: count }, (_, i) => list[Math.floor(i * step)]);
}

export function GallerySection({
  projects,
  categories,
}: {
  projects?: Project[];
  categories?: Category[];
}) {
  const { t, language, dir } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<{ src: string; caption: string } | null>(null);
  const [items, setItems] = useState<{ src: string; caption: string }[]>([]);
  const categorySlugs = (categories ?? []).map((c) => c.slug);
  const categoryName = (slug: string) =>
    (categories ?? []).find((c) => c.slug === slug)?.name;

  useEffect(() => {
    if (!projects) return;
    const flat: { src: string; caption: string; cat: string }[] = [];
    projects.forEach((p) => {
      const caption = p.title[language] ?? p.title.en;
      const cover = { src: p.coverImage, caption, cat: p.category };
      flat.push(cover);
      p.images.forEach((src) => flat.push({ src, caption, cat: p.category }));
    });
    const list = filter === "all" ? flat : flat.filter((f) => f.cat === filter);
    setItems(sample(list, filter === "all" ? CAP_ALL : CAP_FILTERED));
  }, [projects, filter, language]);

  const index = items.findIndex((i) => i.src === active?.src);
  const goPrev = useCallback(() => {
    if (index < 0) return;
    setActive(items[(index - 1 + items.length) % items.length]);
  }, [index, items]);
  const goNext = useCallback(() => {
    if (index < 0) return;
    setActive(items[(index + 1) % items.length]);
  }, [index, items]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!active) return;
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goPrev, goNext]);

  if (!projects) return null;

  return (
    <section className="section-padding bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow={t("gallery.title")}
          titleI18n="gallery.title"
          subtitleI18n="gallery.subtitle"
        />
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categorySlugs.map((s) => {
            const label =
              t(`gallery.categories.${s}`) ??
              categoryName(s)?.[language] ??
              categoryName(s)?.en ??
              s;
            const active = filter === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                aria-pressed={active}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                  active
                    ? "bg-brand-red text-white border-brand-red"
                    : "bg-transparent border-border hover:border-brand-red hover:text-brand-red",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {items.map((it, i) => (
            <button
              key={it.src + i}
              type="button"
              onClick={() => setActive(it)}
              className="group relative block w-full break-inside-avoid overflow-hidden rounded-xl border border-border bg-muted mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
              style={{ aspectRatio: (i % 5 === 0 ? 4 / 5 : i % 3 === 0 ? 16 / 10 : 1) }}
              aria-label={it.caption}
            >
              <Image
                src={it.src}
                alt={it.caption}
                fill
                sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors grid place-items-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 rounded-full bg-white/90 text-foreground px-3 py-1.5 text-xs font-semibold">
                  <ZoomIn className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label={t("common.close")}
            className="absolute top-4 end-4 h-10 w-10 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label={t("common.prev")}
            className="absolute top-1/2 -translate-y-1/2 start-2 sm:start-6 h-11 w-11 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronLeft className={cn("h-6 w-6", dir === "rtl" && "scale-x-[-1]")} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label={t("common.next")}
            className="absolute top-1/2 -translate-y-1/2 end-2 sm:end-6 h-11 w-11 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight className={cn("h-6 w-6", dir === "rtl" && "scale-x-[-1]")} />
          </button>
          <div
            className="relative flex flex-col items-center w-[90vw] max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[65vh] sm:h-[75vh]">
              <Image
                src={active.src}
                alt={active.caption}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </div>
            <p className="mt-3 max-w-full text-white/90 text-sm text-center break-words">
              {active.caption}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
