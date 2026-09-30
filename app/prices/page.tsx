import { PageHeader } from "@/components/PageHeader";
import { Pricing } from "@/components/Pricing";
import { CTASection } from "@/components/Testimonials";

export const metadata = {
  title: "Prices | Redline Deco",
  description:
    "Transparent indicative pricing ranges for drywall, ceilings, partitions, painting and finishing services by Redline Deco — Algeria.",
  alternates: { canonical: "/prices" },
};

export default function PricesPage() {
  return (
    <>
      <PageHeader
        eyebrowI18n="pages.prices.eyebrow"
        titleI18n="pages.prices.title"
        subtitleI18n="pages.prices.subtitle"
      />
      <Pricing preview={false} />
      <CTASection />
    </>
  );
}
