import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 py-3 sm:px-4 sm:py-4">
      <h1 className="sr-only">{t(locale, "nav.sitemap")}</h1>
      <ul className="grid min-h-0 flex-1 grid-cols-2 content-stretch gap-2 overflow-hidden sm:gap-3 xl:grid-cols-3">
        {menus.map((menu) => (
          <li
            key={menu.i18n}
            className={cn("flex min-h-0 flex-col overflow-hidden rounded-xl border shadow-sm", NAV_TONE_CLASS[menu.tone])}
          >
            <Link href={menu.href} className="block shrink-0">
              <span className="relative block h-16 overflow-hidden bg-muted sm:h-20 md:h-24">
                <Image
                  src={thumbUrl(menu.image)}
                  alt={t(locale, menu.i18n)}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                />
              </span>
              <span className="flex items-center justify-between gap-1 px-2 pt-1.5 sm:gap-2 sm:px-3 sm:pt-2">
                <span className="truncate font-serif text-[13px] leading-tight text-primary sm:text-lg">
                  {t(locale, menu.i18n)}
                </span>
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground sm:size-4" aria-hidden />
              </span>
            </Link>
            {menu.children.length ? (
              <ul className="mt-1 min-h-0 flex-1 border-t border-black/10 px-0.5 pb-0.5 sm:px-1 sm:pb-1">
                {menu.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className="flex h-6 items-center justify-between gap-1 rounded-md px-1.5 text-[12px] leading-none text-primary hover:bg-white/50 sm:h-7 sm:px-2 sm:text-sm"
                    >
                      <span className="truncate">{t(locale, child.i18n)}</span>
                      <ChevronRight className="size-3 shrink-0 text-muted-foreground sm:size-3.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
