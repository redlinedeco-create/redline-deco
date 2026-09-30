"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Send,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { CONTACT_INFO } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ContactSection({
  showForm = true,
  showMap = true,
}: {
  showForm?: boolean;
  showMap?: boolean;
}) {
  const { t, language, dir } = useLanguage();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  const items = [
    {
      key: "phone",
      label: t("contact.info.phone"),
      value: CONTACT_INFO.phone,
      href: `tel:${CONTACT_INFO.phone}`,
      icon: Phone,
      tone: "text-sky-600",
    },
    {
      key: "whatsapp",
      label: t("contact.info.whatsapp"),
      value: CONTACT_INFO.phone,
      href: CONTACT_INFO.whatsappLink,
      icon: MessageCircle,
      tone: "text-emerald-600",
    },
    {
      key: "email",
      label: t("contact.info.email"),
      value: CONTACT_INFO.email,
      href: `mailto:${CONTACT_INFO.email}`,
      icon: Mail,
      tone: "text-brand-red",
    },
    {
      key: "location",
      label: t("contact.info.location"),
      value: t("contact.info.locationValue"),
      icon: MapPin,
      tone: "text-amber-600",
    },
  ];

  return (
    <section id="contact" className="section-padding bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow={t("nav.contact")}
          titleI18n="contact.title"
          subtitleI18n="contact.subtitle"
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ key, label, value, href, icon: Icon, tone }) => {
              const Wrapper = href ? "a" : ("div" as any);
              return (
                <Wrapper
                  key={key}
                  {...(href ? { href, target: key === "whatsapp" ? "_blank" : undefined, rel: key === "whatsapp" ? "noopener noreferrer" : undefined } : {})}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 hover:border-brand-red/40 hover:shadow-[0_20px_60px_-30px_rgba(185,28,28,0.3)] transition-all group"
                >
                  <div className="shrink-0 h-11 w-11 grid place-items-center rounded-lg bg-muted text-foreground group-hover:bg-brand-red group-hover:text-white transition-colors">
                    <Icon className={cn("h-5 w-5", tone)} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                      {label}
                    </div>
                    <div className="text-foreground font-medium break-all">{value}</div>
                  </div>
                </Wrapper>
              );
            })}

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${CONTACT_INFO.phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Phone className="h-4 w-4" />
                {t("contact.buttons.call")}
              </a>
              <a
                href={CONTACT_INFO.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:brightness-105 transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                {t("contact.buttons.whatsapp")}
              </a>
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Mail className="h-4 w-4" />
                {t("contact.buttons.email")}
              </a>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-red px-4 py-3 text-sm font-semibold text-white hover:bg-brand-red-600 transition-colors"
              >
                <ArrowRight className={cn("h-4 w-4", dir === "rtl" && "scale-x-[-1]")} />
                {t("contact.buttons.quote")}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {showMap && (
              <div className="rounded-2xl overflow-hidden border border-border bg-card">
                <div className="relative h-56 sm:h-64 w-full bg-muted">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(185,28,28,0.15),transparent_60%)]" />
                  <div className="absolute inset-0 grid place-items-center p-6">
                    <div className="text-center max-w-md">
                      <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-brand-red text-white grid place-items-center shadow-lg">
                        <MapPin className="h-7 w-7" />
                      </div>
                      <h4 className="font-bold text-lg mb-1">{t("contact.map.title")}</h4>
                      <p className="text-muted-foreground">{t("contact.map.placeholder")}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showForm && (
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                <h3 className="font-bold text-xl mb-4">{t("contact.formTitle")}</h3>
                {sent ? (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5 p-6 flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-emerald-900 dark:text-emerald-100">
                      {t("contact.form.success")}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold mb-1.5 block" htmlFor="c-name">
                          {t("contact.form.name")}
                        </label>
                        <input
                          id="c-name"
                          type="text"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          required
                          className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-1.5 block" htmlFor="c-email">
                          {t("contact.form.email")}
                        </label>
                        <input
                          id="c-email"
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          required
                          className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-1.5 block" htmlFor="c-subject">
                        {t("contact.form.subject")}
                      </label>
                      <input
                        id="c-subject"
                        type="text"
                        value={form.subject}
                        onChange={(e) => update("subject", e.target.value)}
                        required
                        className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-1.5 block" htmlFor="c-message">
                        {t("contact.form.message")}
                      </label>
                      <textarea
                        id="c-message"
                        rows={5}
                        value={form.message}
                        onChange={(e) => update("message", e.target.value)}
                        required
                        className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red"
                      />
                    </div>
                    <div className={dir === "rtl" ? "text-left" : "text-right"}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-md bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow hover:bg-brand-red-600 transition-colors"
                      >
                        <Send className={cn("h-4 w-4", dir === "rtl" && "scale-x-[-1]")} />
                        {t("contact.form.submit")}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
