import { useLanguage } from "@/lib/providers/LanguageProvider";

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "center",
  titleI18n,
  subtitleI18n,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  align?: "center" | "start";
  titleI18n?: string;
  subtitleI18n?: string;
}) {
  const { t, language } = useLanguage();

  const resolvedTitle = titleI18n ? t(titleI18n) ?? title : title;
  const resolvedSubtitle = subtitleI18n ? t(subtitleI18n) ?? subtitle : subtitle;

  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center mb-12 lg:mb-16"
          : "mb-10 lg:mb-12 max-w-2xl"
      }
    >
      {eyebrow && (
        <div className="inline-flex items-center gap-2 text-brand-red font-semibold tracking-wider uppercase text-xs sm:text-sm mb-3">
          <span className="block h-px w-8 bg-brand-red" />
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
        {resolvedTitle}
      </h2>
      {resolvedSubtitle && (
        <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
          {resolvedSubtitle}
        </p>
      )}
    </div>
  );
}
