"use client";

import Link from "next/link";
import { MessageCircle, Phone, FileText } from "lucide-react";
import { CONTACT_INFO } from "@/lib/utils";
import { useLanguage } from "@/lib/providers/LanguageProvider";

export function MobileCTABar() {
  const { t } = useLanguage();
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-border bg-background/95 backdrop-blur">
      <div className="grid grid-cols-3 gap-1 p-2">
        <a
          href={CONTACT_INFO.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-md bg-[#25D366] text-white font-semibold text-xs"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{t("mobile.whatsapp")}</span>
        </a>
        <a
          href={`tel:${CONTACT_INFO.phone}`}
          className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-md bg-brand-red text-white font-semibold text-xs"
        >
          <Phone className="h-5 w-5" />
          <span>{t("mobile.call")}</span>
        </a>
        <Link
          href="/quote"
          className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-md bg-foreground text-background font-semibold text-xs"
        >
          <FileText className="h-5 w-5" />
          <span>{t("mobile.quote")}</span>
        </Link>
      </div>
    </div>
  );
}
