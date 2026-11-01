import { AdminDashboard } from "@/components/AdminDashboard";
import { PageHeader } from "@/components/PageHeader";
import {
  getAdminTestimonials,
  getCategories,
  getPricing,
  getProjects,
  getServices,
  getSettingsRows,
  getSiteTextRows,
} from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard | Redline Deco",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin" },
};

export default async function AdminPage() {
  const [projects, categories, services, pricing, testimonials, siteText, settings] =
    await Promise.all([
      getProjects(),
      getCategories(),
      getServices(),
      getPricing(),
      getAdminTestimonials(),
      getSiteTextRows(),
      getSettingsRows(),
    ]);

  return (
    <>
      <PageHeader
        eyebrowI18n="pages.admin.eyebrow"
        titleI18n="pages.admin.title"
        size="compact"
        bordered
      />
      <AdminDashboard
        projects={projects}
        categories={categories}
        services={services}
        pricing={pricing}
        testimonials={testimonials}
        siteText={siteText}
        settings={settings}
      />
    </>
  );
}
