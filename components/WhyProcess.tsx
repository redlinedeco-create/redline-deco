"use client";

import {
  CheckCircle2,
  Paintbrush,
  ClipboardList,
  MessageSquare,
  Home,
  Building2,
  Sparkles,
  Lightbulb,
  Ruler,
  FileText,
  HardHat,
  Handshake,
} from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";

const whyIcons = [Paintbrush, Ruler, Sparkles, Lightbulb, MessageSquare, Building2];
const processIcons = [MessageSquare, Lightbulb, Ruler, FileText, HardHat, Handshake];

export function WhyChooseUs() {
  const { t, language } = useLanguage();
  const keys = ["finishing", "detail", "clean", "custom", "communication", "projects"] as const;
  return (
    <section className="section-padding bg-background relative">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow={t("nav.about")}
          titleI18n="whyUs.title"
          subtitleI18n="whyUs.subtitle"
        />
        <div className="stack-mobile grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {keys.map((k, i) => {
            const Icon = whyIcons[i] ?? CheckCircle2;
            const item = t(`whyUs.items.${k}`);
            return (
              <div
                key={k}
                className="group flex gap-4 rounded-xl border border-border bg-card p-6 hover:border-brand-red/30 hover:shadow-[0_20px_60px_-30px_rgba(185,28,28,0.35)] transition-all"
              >
                <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red group-hover:bg-brand-red group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1.5">{item?.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item?.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ProcessSection() {
  const { t, language, dir } = useLanguage();
  const steps = ["contact", "discuss", "visit", "quote", "begin", "finish"] as const;
  return (
    <section className="section-padding bg-muted/40 relative overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow={t("process.steps.contact.title")}
          titleI18n="process.title"
          subtitleI18n="process.subtitle"
        />
        <div className="relative">
          <div
            className={cn(
              "hidden lg:block absolute top-10 h-1 bg-gradient-to-r from-brand-red/20 via-brand-red/60 to-brand-red/20",
              dir === "rtl"
                ? "right-[8%] left-[8%]"
                : "left-[8%] right-[8%]",
            )}
            aria-hidden
          />
          <ol className="stack-mobile grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {steps.map((k, i) => {
              const Icon = processIcons[i] ?? FileText;
              const item = t(`process.steps.${k}`);
              return (
                <li
                  key={k}
                  className="relative bg-card rounded-xl border border-border p-6 text-center hover:border-brand-red/40 transition-colors"
                >
                  <div className="relative z-10 inline-flex h-20 w-20 items-center justify-center rounded-full bg-card border border-border shadow-sm mb-5">
                    <span className="absolute -top-1.5 -end-1.5 h-7 w-7 rounded-full bg-brand-red text-white text-xs font-bold grid place-items-center border-4 border-card">
                      {i + 1}
                    </span>
                    <Icon className="h-8 w-8 text-brand-red" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item?.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item?.desc}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
