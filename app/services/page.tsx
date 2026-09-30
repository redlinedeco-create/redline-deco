import { PageHeader } from "@/components/PageHeader";
import { Services } from "@/components/Services";
import { CTASection } from "@/components/Testimonials";

export const metadata = {
  title: "Services | Redline Deco",
  description:
    "Drywall installation, false ceilings, partitions, painting, decorative finishes, renovation and custom designs by Redline Deco — Sebdou, Tlemcen.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrowI18n="pages.services.eyebrow"
        titleI18n="pages.services.title"
        subtitleI18n="pages.services.subtitle"
      />
      <Services />
      <CTASection />
    </>
  );
}
