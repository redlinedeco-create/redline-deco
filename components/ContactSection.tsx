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
  Loader2,
  AlertTriangle,
  Hash,
} from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import { EnquiryFallback } from "./EnquiryFallback";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { CONTACT_INFO } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { EMPTY_CONTACT, serverErrorText, type ContactFormValues } from "@/lib/quote";

type SubmitState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done"; reference: string }
  | { kind: "error"; message: string; fields?: Record<string, string> }
  | { kind: "unconfigured" };

export function ContactSection({
  showForm = true,
  showMap = true,
}: {
  showForm?: boolean;
  showMap?: boolean;
}) {
  const { t, language, dir } = useLanguage();
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<ContactFormValues>(EMPTY_CONTACT);
  /** Honeypot: only a bot fills this in. */
  const [website, setWebsite] = useState("");

  const sending = state.kind === "sending";

  function update<K extends keyof ContactFormValues>(
    k: K,
    v: ContactFormValues[K],
  ) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t("quote.required");
    if (!form.email.trim()) errs.email = t("quote.required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = t("quote.invalidEmail");
    }
    if (!form.subject.trim()) errs.subject = t("quote.required");
    if (!form.message.trim()) errs.message = t("quote.required");
    else if (form.message.trim().length < 10) {
      errs.message = t("quote.descriptionTooShort");
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    if (!validate()) return;

    const body = new FormData();
    body.set("source", "contact");
    body.set("locale", language);
    body.set("website", website);
    for (const [key, value] of Object.entries(form)) body.set(key, value);

    setState({ kind: "sending" });

    let res: Response;
    try {
      res = await fetch("/api/quote", { method: "POST", body });
    } catch {
      setState({ kind: "error", message: t("quote.errors.network") });
      return;
    }

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (res.ok && data?.reference) {
      setState({ kind: "done", reference: String(data.reference) });
      setForm(EMPTY_CONTACT);
      setErrors({});
      setWebsite("");
      return;
    }

    if (res.status === 503 || data?.code === "not_configured") {
      setState({ kind: "unconfigured" });
      return;
    }

    if (res.status === 422 && data?.fields) {
      const mapped: Record<string, string> = {};
      for (const [field, code] of Object.entries(data.fields as Record<string, string>)) {
        mapped[field] = serverErrorText(code, t);
      }
      setErrors(mapped);
      setState({ kind: "error", message: t("quote.errors.checkFields"), fields: mapped });
      return;
    }

    setState({
      kind: "error",
      message: data?.error || t("quote.errors.unexpected"),
    });
  }

  const summaryRows = [
    [t("quote.fields.name"), form.name],
    [t("quote.fields.email"), form.email],
    [t("contact.form.subject"), form.subject],
    [t("contact.form.message"), form.message],
  ];
  const summary = summaryRows
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  const fieldClass = (k: string) =>
    cn(
      "w-full rounded-md border border-input bg-background px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red",
      errors[k] && "border-red-500",
    );

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

        <div className="stack-mobile grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
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
                    {/* group-hover must also beat the per-icon tone colour, or
                        the icon stays tinted against the red background. */}
                    <Icon
                      className={cn("h-5 w-5 group-hover:text-white", tone)}
                    />
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
                href="/contact"
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

                {state.kind === "done" ? (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5 p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-emerald-900 dark:text-emerald-100">
                          {t("contact.form.success")}
                        </p>
                        <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs">
                          <Hash className="h-3.5 w-3.5 text-brand-red" />
                          <span className="text-muted-foreground">
                            {t("quote.referenceLabel")}
                          </span>
                          <span className="font-mono font-bold">
                            {state.reference}
                          </span>
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          {t("quote.referenceHint")}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {state.kind === "unconfigured" && (
                      <EnquiryFallback
                        summary={summary}
                        title={t("quote.fallback.title")}
                        hint={t("quote.fallback.subtitle")}
                        subject={t("quote.fallback.subject")}
                      />
                    )}

                    {state.kind === "error" && !state.fields && (
                      <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                        <span>{state.message}</span>
                      </div>
                    )}

                    <form onSubmit={onSubmit} noValidate className="space-y-4">
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
                            className={fieldClass("name")}
                          />
                          {errors.name && (
                            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                              {errors.name}
                            </p>
                          )}
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
                            className={fieldClass("email")}
                          />
                          {errors.email && (
                            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                              {errors.email}
                            </p>
                          )}
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
                          className={fieldClass("subject")}
                        />
                        {errors.subject && (
                          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                            {errors.subject}
                          </p>
                        )}
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
                          className={cn(fieldClass("message"), "resize-y")}
                        />
                        {errors.message && (
                          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                            {errors.message}
                          </p>
                        )}
                      </div>

                      {/* Honeypot: visually hidden, so only scripted fillers touch it. */}
                      <div aria-hidden="true" className="sr-only">
                        <label htmlFor="c-website">Website</label>
                        <input
                          id="c-website"
                          name="website"
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>

                      <div className={dir === "rtl" ? "text-left" : "text-right"}>
                        <button
                          type="submit"
                          disabled={sending}
                          className="inline-flex items-center gap-2 rounded-md bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow hover:bg-brand-red-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send
                              className={cn("h-4 w-4", dir === "rtl" && "scale-x-[-1]")}
                            />
                          )}
                          {sending ? t("quote.sending") : t("contact.form.submit")}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
