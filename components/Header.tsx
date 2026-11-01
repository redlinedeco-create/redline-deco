"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", key: "nav.home" },
  { href: "/services", key: "nav.services" },
  { href: "/portfolio", key: "nav.work" },
  { href: "/prices", key: "nav.prices" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export function Header() {
  const { t, dir } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "h-16 bg-background/90 backdrop-blur-md border-b border-border shadow-sm"
          : "h-20 bg-background/60 backdrop-blur-sm border-b border-transparent",
      )}
    >
      <div className="container h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          aria-label="Redline Deco Home"
        >
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <LanguageSwitcher variant="inline" />
          <ThemeToggle />
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-red text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-brand-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
          >
            {t("nav.quote")}
            <ArrowRight className={cn("h-4 w-4", dir === "rtl" && "scale-x-[-1]")} />
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle className="h-9 w-9" />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-1">
            <nav className="flex flex-col" aria-label="Mobile">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 text-base font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <LanguageSwitcher variant="inline" />
            </div>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-red text-white px-4 py-3 text-base font-semibold shadow-sm hover:bg-brand-red-600 transition-colors"
            >
              {t("nav.quote")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
