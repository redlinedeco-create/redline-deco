import { PageHeader } from "@/components/PageHeader";
import { QuoteForm } from "@/components/QuoteForm";

export const metadata = {
  title: "Request a Quote | Redline Deco",
  description:
    "Tell Redline Deco about your project and receive a free, no-obligation quote. Drywall, painting, ceilings, partitions and renovation in Algeria.",
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
  return (
    <>
      <PageHeader
        eyebrowI18n="pages.quote.eyebrow"
        titleI18n="pages.quote.title"
        subtitleI18n="pages.quote.subtitle"
      />
      <QuoteForm compact={false} />
    </>
  );
}
