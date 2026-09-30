"use client";

import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";

const options: { code: Language; label: string }[] = [
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

export function LanguageSwitcher({
  variant = "inline",
  className,
}: {
  variant?: "inline" | "dropdown";
  className?: string;
}) {
  const { language, setLanguage, t } = useLanguage();

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-1 text-sm font-medium", className)}>
        {options.map((opt, i) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLanguage(opt.code)}
            aria-label={`${opt.label}`}
            aria-pressed={language === opt.code}
            className={cn(
              "px-1.5 py-0.5 rounded transition-colors",
              language === opt.code
                ? "text-brand-red font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      aria-label={t("nav.home")}
      className={cn(
        "bg-transparent border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary",
        className,
      )}
    >
      {options.map((opt) => (
        <option key={opt.code} value={opt.code}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
