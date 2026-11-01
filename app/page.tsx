import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { PortfolioSection } from "@/components/PortfolioSection";
import { WhyChooseUs, ProcessSection } from "@/components/WhyProcess";
import { Pricing } from "@/components/Pricing";
import { CTASection, TestimonialsSection } from "@/components/Testimonials";
import { ContactSection } from "@/components/ContactSection";
import type { Metadata } from "next";
import {
  getCategories,
  getPricing,
  getProjects,
  getServices,
  getSiteText,
  getTestimonials,
} from "@/lib/content";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [projects, categories, services, pricing, testimonials, siteText] =
    await Promise.all([
      getProjects(),
      getCategories(),
      getServices(),
      getPricing(),
      getTestimonials(),
      getSiteText(),
    ]);

  /** Hero copy editable from Admin → Site Text (keys `hero.headline`, …). */
  const heroOverrides = Object.fromEntries(
    Object.entries(siteText).filter(([k]) => k.startsWith("hero.")),
  );

  return (
    <>
      <Hero overrides={heroOverrides} />
      <Services services={services} />
      <PortfolioSection
        featured
        showFilters
        showViewAll
        projects={projects}
        categories={categories}
        services={services}
      />
      <WhyChooseUs />
      <ProcessSection />
      <Pricing preview pricing={pricing} />
      <CTASection />
      <TestimonialsSection testimonials={testimonials} />
      <ContactSection />
    </>
  );
}
