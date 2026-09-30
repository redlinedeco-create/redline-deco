"use client";

import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import { pricing } from "@/data/pricing";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";

const categoryOrder = [
  "drywall",
  "ceilings",
  "partitions",
  "painting",
  "decorative",
  "finishing",
  "other",
];

function formatPrice(n: number, currency: string) {
  if (n === 0) return "";
  return new Intl.NumberFormat("en-DZ", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(n) + (currency ? ` ${currency}` : "");
}

export function Pricing({ preview = false }: { preview?: boolean }) {
  const { t, language, dir } = useLanguage();
  const rows = preview ? pricing.slice(0, 6) : pricing;

  const grouped = categoryOrder
    .map((catKey) => ({
      key: catKey,
      title: t(`pricing.categories.${catKey}`),
      items: rows.filter((p) => p.category === catKey),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <section id="prices" className="section-padding bg-background relative">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow={t("nav.prices")}
          title={preview ? t("pricing.previewTitle") : t("pricing.title")}
          subtitle={preview ? t("pricing.previewSubtitle") : t("pricing.subtitle")}
        />

        <div className="space-y-10">
          {grouped.map((group) => (
            <div key={group.key}>
              <h3 className="text-lg sm:text-xl font-bold mb-4 inline-flex items-center gap-2 text-foreground">
                <span className="block h-2 w-2 rounded-full bg-brand-red" />
                {group.title}
              </h3>
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60 text-muted-foreground text-xs sm:text-sm">
                      <tr>
                        <th className="text-start px-4 sm:px-6 py-3 font-semibold">
                          {t("pricing.columns.service")}
                        </th>
                        <th className="text-start px-3 sm:px-6 py-3 font-semibold hidden sm:table-cell">
                          {t("pricing.columns.description")}
                        </th>
                        <th className="text-start px-3 sm:px-6 py-3 font-semibold w-[120px]">
                          {t("pricing.columns.range")}
                        </th>
                        <th className="text-start px-3 sm:px-6 py-3 font-semibold hidden md:table-cell">
                          {t("pricing.columns.notes")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {group.items.map((p) => {
                        const unit = p.unit[language] ?? p.unit.en;
                        const desc = p.description[language] ?? p.description.en;
                        const name = p.service[language] ?? p.service.en;
                        const notes = p.notes
                          ? p.notes[language] ?? p.notes.en
                          : "";
                        const from = formatPrice(p.priceFrom, p.currency);
                        const to = p.priceTo ? formatPrice(p.priceTo, "") : "";
                        return (
                          <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 sm:px-6 py-4 align-top">
                              <div className="font-semibold text-foreground">{name}</div>
                              <div className="sm:hidden text-muted-foreground text-xs mt-1">
                                {desc}
                              </div>
                            </td>
                            <td className="hidden sm:table-cell px-3 sm:px-6 py-4 align-top text-muted-foreground">
                              {desc}
                            </td>
                            <td className="px-3 sm:px-6 py-4 align-top whitespace-nowrap">
                              <div className="font-semibold text-brand-red">
                                {from || "—"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {to ? `${t("pricing.to")} ${to}` : unit}
                                {to ? ` ${t("pricing.per")} ${unit}` : ""}
                              </div>
                            </td>
                            <td className="hidden md:table-cell px-3 sm:px-6 py-4 align-top text-muted-foreground text-xs">
                              {notes ? notes : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 px-4 sm:px-5 py-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
            {t("pricing.disclaimer")}
          </p>
        </div>

        <div className="mt-10 text-center">
          {preview ? (
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Link
                href="/prices"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card text-foreground px-6 py-3 font-semibold hover:bg-muted transition-colors"
              >
                {t("pricing.seeAll")}
                <ArrowRight className={cn("h-4 w-4", dir === "rtl" && "scale-x-[-1]")} />
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 rounded-md bg-brand-red text-white px-6 py-3 font-semibold shadow hover:bg-brand-red-600 transition-colors"
              >
                {t("pricing.cta")}
                <ArrowRight className={cn("h-4 w-4", dir === "rtl" && "scale-x-[-1]")} />
              </Link>
            </div>
          ) : (
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 rounded-md bg-brand-red text-white px-8 py-4 text-base font-semibold shadow-lg shadow-brand-red/20 hover:bg-brand-red-600 transition-colors"
            >
              {t("pricing.cta")}
              <ArrowRight className={cn("h-5 w-5", dir === "rtl" && "scale-x-[-1]")} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
