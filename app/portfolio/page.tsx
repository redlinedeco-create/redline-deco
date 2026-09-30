import { GallerySection } from "@/components/GallerySection";
import { PageHeader } from "@/components/PageHeader";
import { PortfolioSection } from "@/components/PortfolioSection";

export const metadata = {
  title: "Our Work | Redline Deco",
  description:
    "Portfolio of completed drywall, painting, ceiling and renovation projects by Redline Deco in Sebdou and Tlemcen, Algeria.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  return (
    <>
      <PageHeader
        eyebrowI18n="pages.portfolio.eyebrow"
        titleI18n="pages.portfolio.title"
        subtitleI18n="pages.portfolio.subtitle"
      />
      <PortfolioSection featured={false} showFilters showViewAll={false} />
      <GallerySection />
    </>
  );
}
