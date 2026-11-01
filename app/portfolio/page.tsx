import { GallerySection } from "@/components/GallerySection";
import { PageHeader } from "@/components/PageHeader";
import { PortfolioSection } from "@/components/PortfolioSection";
import { getCategories, getProjects, getServices } from "@/lib/content";

export const revalidate = 60;

export const metadata = {
  title: "Our Work | Redline Deco",
  description:
    "Portfolio of completed drywall, painting, ceiling and renovation projects by Redline Deco in Sebdou and Tlemcen, Algeria.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const [projects, categories, services] = await Promise.all([
    getProjects(),
    getCategories(),
    getServices(),
  ]);

  return (
    <>
      <PageHeader
        eyebrowI18n="pages.portfolio.eyebrow"
        titleI18n="pages.portfolio.title"
        subtitleI18n="pages.portfolio.subtitle"
      />
      <PortfolioSection
        featured={false}
        showFilters
        showViewAll={false}
        projects={projects}
        categories={categories}
        services={services}
      />
      <GallerySection projects={projects} categories={categories} />
    </>
  );
}
