"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, FileText, Folder, FolderOpen, Home, Map } from "lucide-react";
import { NAV } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useT } from "@/components/locale-provider";

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/account")) return pathname === "/account" || pathname.startsWith("/account/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupOpen(pathname: string, href: string, children?: { href: string }[]) {
  if (children?.some((child) => isNavActive(pathname, child.href))) return true;
  return isNavActive(pathname, href);
}

const row = "flex h-6 w-full items-center gap-1 px-1.5 text-left hover:bg-accent";

export function NavTree({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useT();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpen((prev) => {
      const next = { ...prev };
      for (const item of NAV) {
        if (item.children?.length && groupOpen(pathname, item.href, item.children)) {
          next[item.i18n] = true;
        }
      }
      return next;
    });
  }, [pathname]);

  return (
    <nav aria-label={t("explorer")} className="text-[12px] leading-none">
      <Link
        href="/"
        onClick={onNavigate}
        className={cn(row, "border-b border-border", pathname === "/" && "bg-accent font-medium text-primary")}
      >
        <Home className="size-3 shrink-0 text-muted-foreground" aria-hidden />
        <span className="truncate">{t("home")}</span>
      </Link>
      <ul>
        {NAV.map((item) => {
          const hasChildren = Boolean(item.children?.length);
          const expanded = open[item.i18n] ?? groupOpen(pathname, item.href, item.children);
          const currentLeaf = !hasChildren && isNavActive(pathname, item.href);

          return (
            <li key={item.i18n} className="border-b border-border select-none">
              {hasChildren ? (
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen((prev) => ({ ...prev, [item.i18n]: !expanded }))}
                  className={cn(row, groupOpen(pathname, item.href, item.children) && "text-primary")}
                >
                  <ChevronRight
                    className={cn("size-3 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-90")}
                    aria-hidden
                  />
                  {expanded ? (
                    <FolderOpen className="size-3 shrink-0 text-primary" aria-hidden />
                  ) : (
                    <Folder className="size-3 shrink-0 text-primary/80" aria-hidden />
                  )}
                  <span className="truncate font-medium">{t(item.i18n)}</span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={currentLeaf ? "page" : undefined}
                  className={cn(row, currentLeaf && "bg-accent font-medium text-primary")}
                >
                  <Map className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="truncate font-medium">{t(item.i18n)}</span>
                </Link>
              )}
              {hasChildren && expanded ? (
                <ul className="border-t border-border">
                  {item.children!.map((child) => {
                    const current = isNavActive(pathname, child.href);
                    return (
                      <li key={child.href} className="border-b border-border last:border-b-0">
                        <Link
                          href={child.href}
                          onClick={onNavigate}
                          aria-current={current ? "page" : undefined}
                          className={cn(row, "pl-6", current && "bg-accent font-medium text-primary")}
                        >
                          <FileText className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                          <span className="truncate">{t(child.i18n)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
