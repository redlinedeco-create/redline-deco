"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  eyebrowI18n,
  titleI18n,
  subtitleI18n,
  size = "default",
  bordered = false,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  eyebrowI18n?: string;
  titleI18n?: string;
  subtitleI18n?: string;
  size?: "default" | "compact";
  bordered?: boolean;
}) {
  const { t } = useLanguage();

  const resolvedEyebrow = eyebrowI18n ? t(eyebrowI18n) ?? eyebrow : eyebrow;
  const resolvedTitle = titleI18n ? t(titleI18n) ?? title : title;
  const resolvedSubtitle = subtitleI18n ? t(subtitleI18n) ?? subtitle : subtitle;

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        bordered && "border-b border-border",
        size === "compact" ? "py-12 sm:py-14" : "py-16 sm:py-20 lg:py-24"
      )}
    >
      {/* Background image */}
      <Image
        src="/images/tu-use/1000035441.png"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/55 to-black/40" />

      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {resolvedEyebrow && (
          <p
            className={cn(
              "text-brand-red-300 font-semibold uppercase tracking-[0.2em]",
              size === "compact" ? "text-xs mb-2" : "text-sm mb-3"
            )}
          >
            {resolvedEyebrow}
          </p>
        )}
        <h1
          className={cn(
            "font-black tracking-tight text-balance text-white",
            size === "compact"
              ? "text-3xl sm:text-4xl"
              : "text-4xl sm:text-5xl lg:text-6xl"
          )}
        >
          {resolvedTitle}
        </h1>
        {resolvedSubtitle && (
          <p className="mt-5 text-white/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            {resolvedSubtitle}
          </p>
        )}
      </div>
    </section>
  );
}
