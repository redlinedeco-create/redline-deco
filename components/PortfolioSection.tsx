"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Category, Project, ServiceItem } from "@/types";
import { SectionTitle } from "./SectionTitle";
import { PortfolioCard, PortfolioFilters } from "./Portfolio";
import { ProjectDetailModal } from "./ProjectDetailModal";
import { Reveal } from "./Reveal";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";

const filterSlugs = [
  "all",
  "drywall",
  "ceilings",
  "partitions",
  "painting",
  "decorative",
  "renovation",
  "commercial",
  "residential",
];

export function PortfolioSection({
  featured = false,
  showFilters = true,
  showViewAll = true,
  projects: listProp,
  categories,
  services,
}: {
  featured?: boolean;
  showFilters?: boolean;
  showViewAll?: boolean;
  projects?: Project[];
  categories?: Category[];
  services?: ServiceItem[];
}) {
  const { t, dir, language } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [openProject, setOpenProject] = useState<Project | null>(null);

  if (!listProp) return null;

  // Chips come from the database so categories added in /admin show up here.
  // Unused categories are dropped so no chip leads to an empty grid.
  const used = new Set<string>();
  listProp.forEach((p) => {
    used.add(p.category);
    p.services.forEach((s) => used.add(s));
  });
  const chipSlugs =
    categories && categories.length > 0
      ? [
          "all",
          ...categories
            .map((c) => c.slug)
            .filter((s) => s && s !== "all" && used.has(s)),
        ]
      : filterSlugs;

  let list = listProp;
  if (featured) list = list.filter((p) => p.featured);
  if (filter !== "all") {
    list = list.filter(
      (p) =>
        p.category === filter ||
        p.services.includes(filter) ||
        (filter === "commercial" && p.category === "commercial") ||
        (filter === "residential" && p.category === "residential"),
    );
  }

  return (
    <section id="portfolio" className="section-padding bg-muted/40">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow={t("nav.work")}
          title={featured ? t("portfolio.featured") : t("portfolio.title")}
          subtitleI18n="portfolio.subtitle"
        />
        {showFilters && (
          <PortfolioFilters
            value={filter}
            onChange={setFilter}
            slugs={chipSlugs}
            count={list.length}
            categories={categories}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 5) * 70}>
              <PortfolioCard project={p} onOpen={setOpenProject} categories={categories} />
            </Reveal>
          ))}
        </div>

        {list.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">—</div>
        )}

        {showViewAll && featured && (
          <div className="mt-12 text-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-muted transition-colors"
            >
              {t("portfolio.viewAll")}
              <ArrowRight className={cn("h-4 w-4", dir === "rtl" && "scale-x-[-1]")} />
            </Link>
          </div>
        )}
      </div>

      <ProjectDetailModal
        project={openProject}
        onClose={() => setOpenProject(null)}
        categories={categories}
        services={services}
      />
    </section>
  );
}
