"use client";

import Link from "next/link";
import { Quote, ArrowRight, UserRound } from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import { testimonials } from "@/data/testimonials";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";

export function TestimonialsSection() {
  const { t, dir } = useLanguage();
  return (
    <section className="section-padding bg-muted/40">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow={t("testimonials.title")}
          titleI18n="testimonials.title"
          subtitleI18n="testimonials.subtitle"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((tst) => (
            <figure
              key={tst.id}
              className="relative rounded-2xl border border-border bg-card p-6 sm:p-7"
            >
              <Quote className="absolute top-5 end-5 h-7 w-7 text-brand-red/20" />
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-full bg-muted border border-border grid place-items-center text-muted-foreground">
                  <UserRound className="h-6 w-6" />
                </div>
                <div>
                  <figcaption className="font-semibold text-foreground">
                    {tst.isPlaceholder ? "—" : tst.name}
                  </figcaption>
                  <p className="text-xs text-muted-foreground">
                    {tst.project ?? "—"}
                  </p>
                </div>
              </div>
              <blockquote className="text-sm sm:text-base leading-relaxed text-muted-foreground italic">
                “{tst.isPlaceholder ? t("testimonials.placeholder") : tst.review}”
              </blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  const { t, dir } = useLanguage();
  return (
    <section className="relative overflow-hidden section-padding">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-red-700 via-brand-red to-brand-red-600" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
      <div className="container max-w-5xl relative mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-balance">
          {t("cta.title")}
        </h2>
        <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          {t("cta.subtitle")}
        </p>
        <Link
          href="/quote"
          className="inline-flex items-center gap-2 rounded-md bg-white text-brand-red px-8 py-4 text-base font-bold shadow-2xl hover:bg-white/95 hover:-translate-y-0.5 transition-all"
        >
          {t("cta.button")}
          <ArrowRight className={cn("h-5 w-5", dir === "rtl" && "scale-x-[-1]")} />
        </Link>
      </div>
    </section>
  );
}
