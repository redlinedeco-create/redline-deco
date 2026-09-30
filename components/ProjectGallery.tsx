"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/providers/LanguageProvider";

export function ProjectGallery({
  images,
  projectTitle,
}: {
  images: string[];
  projectTitle?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const { t, dir } = useLanguage();

  const goPrev = useCallback(() => {
    setActive((i) => (i === null ? i : (i - 1 + images.length) % images.length));
  }, [images.length]);
  const goNext = useCallback(() => {
    setActive((i) => (i === null ? i : (i + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (active === null) return;
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goPrev, goNext]);

  useEffect(() => {
    document.body.style.overflow = active !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className="group relative block aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
            aria-label={`${projectTitle ?? "Image"} ${i + 1}`}
          >
            <Image
              src={src}
              alt={`${projectTitle ?? "Project"} image ${i + 1}`}
              fill
              sizes="(max-width:768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>

      {active !== null && (
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
            className="relative w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active]}
              alt={`${projectTitle ?? "Project"} image ${active + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}
