"use client";

import Link from "next/link";
import {
  Layers,
  PanelTop,
  Brush,
  Palette,
  PaintRoller,
  Hammer,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import { services } from "@/data/services";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

const CeilingLight = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v6" />
    <circle cx="12" cy="12" r="5" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </svg>
);

const iconMap: Record<string, ComponentType<any>> = {
  Layers,
  Ceiling: CeilingLight,
  PanelTop,
  Brush,
  Palette,
  PaintRoller,
  Hammer,
  Sparkles,
};

export function ServiceCard({ service }: { service: (typeof services)[number] }) {
  const { t, language } = useLanguage();
  const Icon = iconMap[service.icon] ?? Layers;
  const name = service.name[language] ?? service.name.en;
  const desc = service.description[language] ?? service.description.en;

  return (
    <Link
      href="/services"
      className="group relative block rounded-xl border border-border bg-card p-6 sm:p-8 h-full hover:border-brand-red/40 hover:shadow-[0_20px_60px_-30px_rgba(185,28,28,0.4)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
    >
      <div className="absolute top-0 start-0 h-1 w-0 group-hover:w-full bg-brand-red transition-all duration-500 rounded-t-xl" />
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red group-hover:bg-brand-red group-hover:text-white transition-colors">
          <Icon className="h-6 w-6" strokeWidth={2} />
        </div>
        <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-brand-red opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0" />
      </div>
      <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-brand-red transition-colors">
        {name}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground mb-5">{desc}</p>
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red">
        {t("services.learnMore")}
        <ArrowUpRight className={cn("h-4 w-4", language === "ar" && "scale-x-[-1]")} />
      </span>
    </Link>
  );
}

export function Services({ limit }: { limit?: number }) {
  const { t } = useLanguage();
  const items = limit ? services.slice(0, limit) : services;
  return (
    <section id="services" className="section-padding bg-background relative">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow={t("nav.services")}
          titleI18n="services.title"
          subtitleI18n="services.subtitle"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
