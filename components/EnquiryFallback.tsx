"use client";

import { AlertTriangle, Mail, MessageCircle, Phone } from "lucide-react";

import { useLanguage } from "@/lib/providers/LanguageProvider";
import { CONTACT_INFO } from "@/lib/utils";
import { mailtoLink, whatsappLink } from "@/lib/quote";

/**
 * Fallback shown when a form cannot be stored server side (Supabase is not
 * configured on this deployment, or the request failed).
 *
 * The message is already written out into WhatsApp, email and a plain phone
 * call, so an enquiry is never a dead end -- the visitor just sends it another
 * way instead of thinking it went through.
 */
export function EnquiryFallback({
  summary,
  title,
  hint,
  subject,
}: {
  summary: string;
  title: string;
  hint: string;
  subject: string;
}) {
  const { t } = useLanguage();
  const text = `${subject}\n\n${summary}`;

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6 dark:border-amber-500/30 dark:bg-amber-500/5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>

          <pre className="mt-4 whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
            {summary || t("quote.fallback.empty")}
          </pre>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={whatsappLink(text)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-105"
            >
              <MessageCircle className="h-4 w-4" />
              {t("contact.buttons.whatsapp")}
            </a>
            <a
              href={mailtoLink(subject, summary, CONTACT_INFO.email)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Mail className="h-4 w-4" />
              {t("contact.buttons.email")}
            </a>
            <a
              href={`tel:${CONTACT_INFO.phoneInternational}`}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Phone className="h-4 w-4" />
              {CONTACT_INFO.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
