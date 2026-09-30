import { AboutPage as AboutSections } from "@/components/About";
import { PageHeader } from "@/components/PageHeader";
import { CTASection } from "@/components/Testimonials";

export const metadata = {
  title: "About Us | Redline Deco",
  description:
    "Redline Deco — specialists in drywall installation, painting, false ceilings, partitions and interior finishing, based in Sebdou / Tlemcen, Algeria.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrowI18n="pages.about.eyebrow"
        titleI18n="pages.about.title"
        subtitleI18n="pages.about.subtitle"
      />
      <AboutSections />
      <CTASection />
    </>
  );
}
