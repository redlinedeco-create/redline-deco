import { AdminDashboard } from "@/components/AdminDashboard";
import { PageHeader } from "@/components/PageHeader";

export const metadata = {
  title: "Admin Dashboard | Redline Deco",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin" },
};

export default function AdminPage() {
  return (
    <>
      <PageHeader
        eyebrowI18n="pages.admin.eyebrow"
        titleI18n="pages.admin.title"
        size="compact"
        bordered
      />
      <AdminDashboard />
    </>
  );
}
