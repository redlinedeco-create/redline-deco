import { PageHeader } from "@/components/PageHeader";
import { Services } from "@/components/Services";
import { CTASection } from "@/components/Testimonials";
import { getServices } from "@/lib/content";

export const revalidate = 60;

export const metadata = {
  title: "Services | Redline Deco",
  description:
    "Drywall installation, false ceilings, partitions, painting, decorative finishes, renovation and custom designs by Redline Deco — Sebdou, Tlemcen.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHeader
        eyebrowI18n="pages.services.eyebrow"
        titleI18n="pages.services.title"
        subtitleI18n="pages.services.subtitle"
      />
      <Services services={services} />
      <CTASection />
    </>
  );
}
