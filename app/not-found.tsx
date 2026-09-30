"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { useLanguage, useDirection } from "@/lib/providers/LanguageProvider";
import { CONTACT_INFO } from "@/lib/utils";

export default function NotFound() {
  const { t } = useLanguage();
  const { dir } = useDirection();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-red-50 to-white dark:from-brand-red-950/40 dark:to-background">
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
        <p className="text-brand-red font-black text-6xl sm:text-8xl tracking-tight leading-none">
          404
        </p>
        <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-balance">
          {t("notFound.title")}
        </h1>
        <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl mx-auto text-balance">
          {t("notFound.description")}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 w-full sm:w-auto justify-center rounded-md bg-brand-red text-white px-6 py-3.5 text-base font-semibold shadow-lg shadow-brand-red/20 hover:bg-brand-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
          >
            {dir === "rtl" ? (
              <Home className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            )}
            {t("notFound.backHome")}
          </Link>
          <a
            href={CONTACT_INFO.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full sm:w-auto rounded-md border border-border hover:bg-muted text-foreground px-6 py-3.5 text-base font-semibold transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
