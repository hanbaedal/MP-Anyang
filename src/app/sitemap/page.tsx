import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { readSession } from "@/lib/auth";
import { NAV_TONE_CLASS, sitemapMenus } from "@/lib/site";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "sitemap.title") };
}

export default async function SitemapPage() {
  const locale = await readLocale();
  const session = await readSession();
  const menus = sitemapMenus(session?.role);

  return (
    <div className="flex h-full min-h-0 flex-col px-2 py-2 sm:px-3 sm:py-2.5">
      <h1 className="sr-only">{t(locale, "nav.sitemap")}</h1>
      <ul
        className={cn(
          "grid min-h-0 flex-1 auto-rows-min content-start gap-1.5 overflow-y-auto overscroll-y-contain sm:gap-2",
          "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
        )}
      >
        {menus.map((menu) => (
          <li
            key={menu.i18n}
            className={cn(
              "flex min-w-0 flex-col overflow-hidden rounded-lg border",
              NAV_TONE_CLASS[menu.tone],
            )}
          >
            <Link
              href={menu.href}
              className="flex items-center gap-0.5 border-b border-black/10 px-2 py-1.5 hover:bg-white/40"
            >
              <span className="min-w-0 flex-1 truncate text-xs font-semibold leading-tight text-primary">
                {t(locale, menu.i18n)}
              </span>
              <ChevronRight className="size-3 shrink-0 text-muted-foreground/80" aria-hidden />
            </Link>
            {menu.children.length ? (
              <ul
                className={cn(
                  "divide-y divide-black/5 py-px",
                  menu.children.length > 8 && "max-h-[11rem] overflow-y-auto overscroll-y-contain",
                )}
              >
                {menu.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className="flex h-5 items-center px-2 text-[11px] leading-none text-primary/90 hover:bg-white/45 sm:h-[1.375rem] sm:text-xs"
                    >
                      <span className="truncate">{t(locale, child.i18n)}</span>
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
