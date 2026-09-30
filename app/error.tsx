"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/providers/LanguageProvider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-red-50 to-white dark:from-brand-red-950/40 dark:to-background">
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
        <AlertTriangle
          className="mx-auto h-12 w-12 text-brand-red"
          aria-hidden="true"
        />
        <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-balance">
          {t("error.title")}
        </h1>
        <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl mx-auto text-balance">
          {t("error.description")}
        </p>

        {error.digest && (
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 w-full sm:w-auto justify-center rounded-md bg-brand-red text-white px-6 py-3.5 text-base font-semibold shadow-lg shadow-brand-red/20 hover:bg-brand-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t("error.retry")}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full sm:w-auto rounded-md border border-border hover:bg-muted text-foreground px-6 py-3.5 text-base font-semibold transition-colors"
          >
            {t("error.backHome")}
          </Link>
        </div>
      </div>
    </section>
  );
}
