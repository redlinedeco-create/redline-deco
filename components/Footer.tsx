"use client";

import Link from "next/link";
import { Facebook, Instagram, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { CONTACT_INFO } from "@/lib/utils";

/** Lucide has no TikTok brand mark, so it is drawn inline. */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const quickLinks = [
  { href: "/", key: "nav.home" },
  { href: "/services", key: "nav.services" },
  { href: "/portfolio", key: "nav.work" },
  { href: "/prices", key: "nav.prices" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative border-t border-border bg-card mt-0">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="stack-mobile grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label="Redline Deco Home"
              className="inline-flex items-center gap-2 mb-4"
            >
              <Logo />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              {t("about.text")}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-brand-red transition-colors"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-brand-red shrink-0" />
                <a
                  href={`tel:${CONTACT_INFO.phone}`}
                  className="text-muted-foreground hover:text-brand-red transition-colors"
                >
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-brand-red shrink-0" />
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="text-muted-foreground hover:text-brand-red transition-colors break-all"
                >
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-brand-red shrink-0" />
                <span className="text-muted-foreground">{CONTACT_INFO.location.full}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("footer.followUs")}</h3>
            <div className="flex items-center gap-2 mb-6">
              <a
                href={CONTACT_INFO.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={CONTACT_INFO.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={CONTACT_INFO.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
              <a
                href={CONTACT_INFO.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <LanguageSwitcher variant="inline" />
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-border flex flex-col sm:flex-row gap-3 items-center justify-between">
          <p className="text-xs text-muted-foreground">{t("footer.copyright")}</p>
          <p className="text-xs text-muted-foreground">
            <a
              href={`https://${CONTACT_INFO.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-red transition-colors"
            >
              {CONTACT_INFO.website}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
