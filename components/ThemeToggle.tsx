"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/providers/ThemeProvider";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();

  const rtlFix = language === "ar";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
      aria-pressed={theme === "dark"}
      className={cn(
        "inline-flex items-center justify-center h-9 w-9 rounded-md border border-border bg-background hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
    >
      {theme === "dark" ? (
        <Sun className={cn("h-4 w-4 text-yellow-400", rtlFix && "scale-x-[-1]")} />
      ) : (
        <Moon className={cn("h-4 w-4", rtlFix && "scale-x-[-1]")} />
      )}
    </button>
  );
}
