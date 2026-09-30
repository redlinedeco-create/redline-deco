"use client";

import { MessageCircle } from "lucide-react";
import { CONTACT_INFO } from "@/lib/utils";

export function WhatsAppButton() {
  return (
    <a
      href={CONTACT_INFO.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-24 md:bottom-6 z-40 rtl:left-6 rtl:right-auto ltr:right-6 ltr:left-auto inline-flex items-center justify-center h-14 w-14 rounded-full shadow-[0_10px_40px_-10px_rgba(37,211,102,0.6)] bg-[#25D366] text-white hover:scale-105 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-green-300"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" stroke="none" />
      <span className="sr-only">WhatsApp</span>
    </a>
  );
}
