import { ContactSection } from "@/components/ContactSection";
import { PageHeader } from "@/components/PageHeader";

export const metadata = {
  title: "Contact | Redline Deco",
  description:
    "Get in touch with Redline Deco — phone, WhatsApp, email or visit us in Sebdou, Tlemcen. Request a free quote.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrowI18n="pages.contact.eyebrow"
        titleI18n="pages.contact.title"
        subtitleI18n="pages.contact.subtitle"
      />
      <ContactSection showForm showMap />
    </>
  );
}
