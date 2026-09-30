import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { PortfolioSection } from "@/components/PortfolioSection";
import { BeforeAfterSection } from "@/components/BeforeAfter";
import { WhyChooseUs, ProcessSection } from "@/components/WhyProcess";
import { Pricing } from "@/components/Pricing";
import { CTASection, TestimonialsSection } from "@/components/Testimonials";
import { ContactSection } from "@/components/ContactSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <PortfolioSection featured showFilters showViewAll />
      <BeforeAfterSection
        before="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=empty%20old%20room%20unfinished%20walls%20construction%20site%20before%20renovation&image_size=landscape_16_9"
        after="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=modern%20minimal%20apartment%20interior%20living%20room%20with%20white%20walls%20accent%20red%20pillow%20recessed%20ceiling%20lights%20professional%20construction%20photography&image_size=landscape_16_9"
      />
      <WhyChooseUs />
      <ProcessSection />
      <Pricing preview />
      <CTASection />
      <TestimonialsSection />
      <ContactSection />
    </>
  );
}
