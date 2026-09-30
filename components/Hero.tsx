"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Briefcase, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";

const heroImageUrl =
  "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=professional%20construction%20interior%20finishing%20worker%20painting%20white%20wall%20drywall%20gypsum%20board%20installation%20modern%20room%20red%20accents%20professional%20photography%20wide%20angle&image_size=landscape_16_9";

export function Hero() {
  const { t, dir } = useLanguage();
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[620px] sm:h-[680px] lg:h-[760px] w-full">
        <Image
          src={heroImageUrl}
          alt="Professional interior finishing work"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20 dark:from-black/90 dark:via-black/70 dark:to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute inset-0 top-0 flex items-center">
        <div
          className={cn(
            "max-w-2xl space-y-7 animate-fade-in",
            dir === "rtl" ? "text-right ml-auto" : "text-left",
          )}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur px-4 py-1.5 text-xs sm:text-sm font-medium text-white/90">
            <MapPin className="h-3.5 w-3.5 text-brand-red-300" />
            <span>{t("hero.location")}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white text-balance leading-[1.05]">
            {t("hero.headline")}
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-xl leading-relaxed">
            {t("hero.subheadline")}
          </p>

          <div
            className={cn(
              "flex flex-wrap gap-3 sm:gap-4",
              dir === "rtl" ? "justify-end" : "justify-start",
            )}
          >
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 rounded-md bg-brand-red text-white px-6 py-3.5 text-sm sm:text-base font-semibold shadow-lg shadow-brand-red/20 hover:bg-brand-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {t("hero.primaryCta")}
              <ArrowRight className={cn("h-4 w-4", dir === "rtl" && "scale-x-[-1]")} />
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-md bg-white/10 backdrop-blur border border-white/20 text-white px-6 py-3.5 text-sm sm:text-base font-semibold hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Briefcase className="h-4 w-4" />
              {t("hero.secondaryCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
