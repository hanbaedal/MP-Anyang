import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { NAV_TONE_CLASS, sitemapMenus } from "@/lib/site";
import { thumbUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "sitemap.title") };
}

export default async function SitemapPage() {
  const locale = await readLocale();
  const menus = sitemapMenus();

  return (
    <>
      <PageHero kicker={t(locale, "sitemap.kicker")} title={t(locale, "sitemap.title")} lead={t(locale, "sitemap.lead")} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {menus.map((menu) => (
            <li
              key={menu.i18n}
              className={cn("flex flex-col overflow-hidden rounded-xl border shadow-sm", NAV_TONE_CLASS[menu.tone])}
            >
              <Link href={menu.href} className="block">
                <span className="relative block h-28 overflow-hidden bg-muted">
                  <Image
                    src={thumbUrl(menu.image)}
                    alt={t(locale, menu.i18n)}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                </span>
                <span className="flex items-center justify-between gap-2 px-3 pt-3">
                  <span className="font-serif text-lg leading-tight text-primary">{t(locale, menu.i18n)}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </span>
              </Link>
              {menu.children.length ? (
                <ul className="mt-2 border-t border-black/10 px-1 pb-1">
                  {menu.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-primary hover:bg-white/50"
                      >
                        <span className="truncate">{t(locale, child.i18n)}</span>
                        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 pb-3 pt-1 text-xs text-muted-foreground">{t(locale, "sitemap.open")}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
