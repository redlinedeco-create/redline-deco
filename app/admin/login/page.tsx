import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/AdminLoginForm";
import { getAdminUser } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in | Redline Deco Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Middleware already bounces signed-in users to /admin; this covers the case
  // where it is skipped.
  const user = await getAdminUser();
  if (user) redirect("/admin");

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 sm:p-9 shadow-sm">
        <Suspense
          fallback={<div className="h-72 animate-pulse rounded-lg bg-muted/50" />}
        >
          <AdminLoginForm />
        </Suspense>
      </div>
    </main>
  );
}