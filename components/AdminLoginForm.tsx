"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";

import { getBrowserAuthClient } from "@/lib/supabase/browser";
import { useLanguage } from "@/lib/providers/LanguageProvider";

/**
 * Email + password sign-in. Deliberately does not enumerate accounts: the
 * error message is identical whether the email is unknown or the password is
 * wrong, so the form cannot be used to discover who has admin access.
 */
export function AdminLoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const supabase = getBrowserAuthClient();
    if (!supabase) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart.",
      );
      return;
    }

    setSubmitting(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);

    if (authError) {
      setError(t("admin.login.invalid"));
      return;
    }

    // Only ever redirect within this site -- an attacker-supplied absolute URL
    // here would turn the login page into an open redirect.
    const next = params.get("next");
    const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
    router.replace(target);
    router.refresh();
  };

  return (
    <>
      <div className="mb-7 text-center">
        <div className="mx-auto mb-4 h-12 w-12 grid place-items-center rounded-full bg-brand-red/10 text-brand-red">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("admin.login.title")}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("admin.login.subtitle")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="admin-email"
          className="block text-sm font-medium mb-1.5"
        >
          {t("admin.login.emailLabel")}
        </label>
        <input
          id="admin-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="block text-sm font-medium mb-1.5"
        >
          {t("admin.login.passwordLabel")}
        </label>
        <input
          id="admin-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-colors"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        {t("admin.login.signIn")}
      </button>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {t("admin.login.tip")}
      </p>
    </form>
    </>
  );
}