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

/** 하위 링크가 많을 때 카드 높이 상한 (px) */
const DENSE_CHILD_MAX = 6;
const DENSE_LIST_MAX_H = "max-h-24";

export default async function SitemapPage() {
  const locale = await readLocale();
  const session = await readSession();
  const menus = sitemapMenus(session?.role);

  return (
    <div className="flex h-full min-h-0 flex-col px-2 py-1.5 sm:px-3 sm:py-2">
      <h1 className="sr-only">{t(locale, "nav.sitemap")}</h1>
      <ul
        className={cn(
          "grid min-h-0 flex-1 auto-rows-min content-start gap-1 overflow-y-auto overscroll-y-contain sm:gap-1.5",
          /* ~기존 2열 카드 폭의 절반: auto-fill로 좁은 타일 */
          "grid-cols-[repeat(auto-fill,minmax(5.75rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(6.25rem,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(7rem,1fr))]",
        )}
      >
        {menus.map((menu) => (
          <li
            key={menu.i18n}
            className={cn(
              "flex min-w-0 flex-col overflow-hidden rounded-md border",
              NAV_TONE_CLASS[menu.tone],
            )}
          >
            <Link
              href={menu.href}
              className="flex items-center gap-px border-b border-black/10 px-1.5 py-1 hover:bg-white/40"
            >
              <span className="min-w-0 flex-1 truncate text-[10px] font-semibold leading-none text-primary sm:text-[11px]">
                {t(locale, menu.i18n)}
              </span>
              <ChevronRight className="size-2.5 shrink-0 text-muted-foreground/80" aria-hidden />
            </Link>
            {menu.children.length ? (
              <ul
                className={cn(
                  "divide-y divide-black/5",
                  menu.children.length > DENSE_CHILD_MAX && cn(DENSE_LIST_MAX_H, "overflow-y-auto overscroll-y-contain"),
                )}
              >
                {menu.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className="flex h-4 items-center px-1.5 text-[10px] leading-none text-primary/90 hover:bg-white/45"
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
