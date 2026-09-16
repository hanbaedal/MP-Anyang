import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { NAV_TONE_CLASS, sitemapSections } from "@/lib/site";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "sitemap.title") };
}

export default async function SitemapPage() {
  const locale = await readLocale();
  const sections = sitemapSections();

  return (
    <>
      <PageHero kicker={t(locale, "sitemap.kicker")} title={t(locale, "sitemap.title")} lead={t(locale, "sitemap.lead")} />
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        {sections.map((section) => (
          <section key={section.titleI18n} aria-labelledby={`sitemap-${section.titleI18n}`}>
            <h2 id={`sitemap-${section.titleI18n}`} className="mb-3 font-serif text-xl">
              {t(locale, section.titleI18n)}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <li key={`${section.titleI18n}-${item.href}`}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-primary shadow-sm transition-colors",
                      NAV_TONE_CLASS[section.tone],
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-serif text-lg leading-tight">{t(locale, item.i18n)}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{t(locale, "sitemap.open")}</span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
