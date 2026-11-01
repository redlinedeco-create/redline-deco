"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { MapPin, ArrowUpRight } from "lucide-react";
import type { Category, Project } from "@/types";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";

export function PortfolioCard({
  project,
  onOpen,
  categories,
}: {
  project: Project;
  onOpen?: (p: Project) => void;
  categories?: Category[];
}) {
  const { language, dir } = useLanguage();
  const title = project.title[language] ?? project.title.en;
  const location = project.location[language] ?? project.location.en;
  const cat = categories?.find((c) => c.slug === project.category);
  const catName = cat?.name[language] ?? project.category;

  return (
    <article className="group relative h-full focus-within:ring-2 focus-within:ring-brand-red focus-within:ring-offset-2 focus-within:ring-offset-background rounded-2xl transition-transform duration-500 ease-out hover:-translate-y-1.5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted ring-1 ring-inset ring-black/5 dark:ring-white/10">
        <Image
          src={project.coverImage}
          alt={title}
          fill
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
        />
      </div>

      <div className="pt-5">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">
          <span className="truncate">{catName}</span>
          <span aria-hidden="true" className="h-px w-3 bg-brand-red/40" />
          <span className="text-muted-foreground/80 font-medium tabular-nums">
            {project.year}
          </span>
        </p>

        <h3 className="mt-2.5 text-lg lg:text-xl font-bold tracking-tight text-balance">
          <button
            type="button"
            onClick={() => onOpen?.(project)}
            className="text-start after:absolute after:inset-0 after:content-[''] rounded-sm focus:outline-none"
          >
            <span className="relative inline-block">
              {title}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -bottom-0.5 start-0 h-px w-full bg-brand-red transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-within:scale-x-100",
                  dir === "rtl" ? "origin-right scale-x-0" : "origin-left scale-x-0"
                )}
              />
            </span>
          </button>
        </h3>

        <div className="mt-2 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-red/70" aria-hidden="true" />
            <span className="truncate">{location}</span>
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground/50 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-red",
              dir === "rtl" && "-scale-x-100 group-hover:-translate-x-0.5"
            )}
          />
        </div>
      </div>
    </article>
  );
}

export function PortfolioFilters({
  value,
  onChange,
  slugs,
  count,
  categories: catsProp,
}: {
  value: string;
  onChange: (s: string) => void;
  slugs: string[];
  count?: number;
  categories?: Category[];
}) {
  const { language, t } = useLanguage();
  const cats = (catsProp ?? []).filter((c) => slugs.includes(c.slug));
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const active = list.querySelector<HTMLElement>('[data-active="true"]');
      if (!active) {
        setIndicator({ left: 0, width: 0 });
        return;
      }
      setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [value, language]);

  useEffect(() => {
    const onResize = () => {
      const list = listRef.current;
      const active = list?.querySelector<HTMLElement>('[data-active="true"]');
      if (list && active) {
        setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="mb-10 lg:mb-14">
      {typeof count === "number" && (
        <p className="mb-5 text-center text-sm text-muted-foreground tabular-nums">
          {String(t("portfolio.count") ?? "{n} projects").replace("{n}", String(count))}
        </p>
      )}

      <div
        ref={listRef}
        role="group"
        aria-label={t("portfolio.title")}
        className="relative flex flex-wrap justify-center gap-x-1 gap-y-2 border-b border-border"
      >
        {cats.map((c) => {
          const label = c.name[language] ?? c.name.en;
          const active = value === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              aria-pressed={active}
              data-active={active}
              onClick={() => onChange(c.slug)}
              className={cn(
                "relative -mb-px px-3 py-3 text-sm font-medium transition-colors duration-300 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4",
                active
                  ? "text-brand-red"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          );
        })}

        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-0 h-0.5 bg-brand-red transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            indicator.width === 0 && "opacity-0"
          )}
          style={{ left: indicator.left, width: indicator.width }}
        />
      </div>
    </div>
  );
}
