"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { SectionTitle } from "./SectionTitle";
import { cn } from "@/lib/utils";

export function BeforeAfter({
  before,
  after,
  beforeAlt,
  afterAlt,
}: {
  before: string;
  after: string;
  beforeAlt?: string;
  afterAlt?: string;
}) {
  const { t, language } = useLanguage();
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const calc = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return 50;
    const rect = el.getBoundingClientRect();
    const x =
      language === "ar" ? rect.right - clientX : clientX - rect.left;
    const pct = (x / rect.width) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [language]);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setPos(calc(e.clientX));
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    setPos(calc(e.clientX));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current || !e.touches[0]) return;
      setPos(calc(e.touches[0].clientX));
    };
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => window.removeEventListener("touchmove", onTouchMove);
  }, [calc]);

  const sliderStyle =
    language === "ar"
      ? { clipPath: `inset(0 ${100 - pos}% 0 0)` }
      : { clipPath: `inset(0 0 0 ${pos}%)` };

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden rounded-xl border border-border aspect-[16/9] bg-muted touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="absolute inset-0">
        <Image
          src={before}
          alt={beforeAlt ?? t("beforeAfter.before")}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0" style={sliderStyle}>
        <Image
          src={after}
          alt={afterAlt ?? t("beforeAfter.after")}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div
        className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
        style={{ [language === "ar" ? "right" : "left"]: `${pos}%` }}
      >
        <div className="absolute top-1/2 h-11 w-11 rounded-full bg-white text-brand-red shadow-lg grid place-items-center cursor-ew-resize" style={{ transform: language === "ar" ? "translateY(-50%) translateX(50%)" : "translateY(-50%) translateX(-50%)" }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
            <polyline points="9 18 3 12 9 6" style={{transform:"translateX(6px)"}}/>
          </svg>
        </div>
      </div>

      <div className="absolute top-3 start-3 rounded-md bg-black/60 text-white text-xs font-bold px-2.5 py-1 backdrop-blur">
        {t("beforeAfter.before")}
      </div>
      <div className="absolute top-3 end-3 rounded-md bg-brand-red text-white text-xs font-bold px-2.5 py-1 backdrop-blur">
        {t("beforeAfter.after")}
      </div>
    </div>
  );
}

export function BeforeAfterSection({
  before,
  after,
}: {
  before: string;
  after: string;
}) {
  const { t } = useLanguage();
  return (
    <section className="section-padding bg-muted/40 relative">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow={t("beforeAfter.before") + " / " + t("beforeAfter.after")}
          titleI18n="beforeAfter.title"
          subtitleI18n="beforeAfter.subtitle"
        />
        <div className="mx-auto max-w-4xl">
          <BeforeAfter before={before} after={after} />
        </div>
      </div>
    </section>
  );
}
