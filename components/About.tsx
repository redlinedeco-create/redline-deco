"use client";

import Image from "next/image";
import { SectionTitle } from "./SectionTitle";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { WhyChooseUs } from "./WhyProcess";
import { ProcessSection } from "./WhyProcess";

export function AboutSection() {
  const { t, language } = useLanguage();
  return (
    <section id="about" className="section-padding bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative order-2 lg:order-1 isolate">
            <div className="relative z-10 aspect-square max-w-lg mx-auto rounded-2xl overflow-hidden border border-border bg-card shadow-sm p-4 sm:p-6 flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src="/images/tu-use/file_00000000aaf0720cbc3809a52adf3faa (2).png"
                  alt={t("about.title")}
                  fill
                  className="object-contain"
                  sizes="(max-width:1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
            <div className="absolute -bottom-4 -end-4 hidden sm:block h-32 w-32 rounded-xl bg-brand-red z-0" />
            <div className="absolute -top-4 -start-4 hidden sm:block h-24 w-24 rounded-xl border border-brand-red z-0" />
          </div>
          <div className="order-1 lg:order-2">
            <SectionTitle
              align="start"
              eyebrow={t("nav.about")}
              titleI18n="about.title"
              subtitleI18n="about.subtitle"
            />
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
              {t("about.text")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutPage() {
  return (
    <>
      <AboutSection />
      <WhyChooseUs />
      <ProcessSection />
    </>
  );
}
