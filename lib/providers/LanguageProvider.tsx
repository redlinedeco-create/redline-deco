"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Language } from "@/types";
import { translations, defaultLanguage } from "@/lib/i18n";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: "ltr" | "rtl";
  t: (path: string) => any;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getNested(obj: any, path: string) {
  return path.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), obj);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("language") as Language | null;
    const valid: Language[] = ["en", "fr", "ar"];
    if (stored && valid.includes(stored)) {
      setLanguageState(stored);
    } else {
      const nav = (navigator.language || "en").slice(0, 2) as Language;
      if (valid.includes(nav)) setLanguageState(nav);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("language", language);
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const dir = language === "ar" ? "rtl" : "ltr";
    const dict = translations[language] || translations.en;
    return {
      language,
      setLanguage: setLanguageState,
      dir,
      t: (path: string) => getNested(dict, path),
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useTranslation() {
  return useLanguage();
}

export function useDirection() {
  const { dir, language } = useLanguage();
  return { dir, language };
}
