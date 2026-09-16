"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, FileText, Folder, FolderOpen, Home } from "lucide-react";
import { NAV } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useT } from "@/components/locale-provider";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/account")) return pathname === "/account" || pathname.startsWith("/account/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupOpen(pathname: string, href: string, children?: { href: string }[]) {
  if (children?.some((child) => isActive(pathname, child.href))) return true;
  return isActive(pathname, href);
}

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
    <nav aria-label={t("explorer")} className="text-[13px] leading-5">
      <Link
        href="/"
        onClick={onNavigate}
        className={cn(
          "mb-1 flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-accent",
          pathname === "/" && "bg-accent font-medium text-primary",
        )}
      >
        <Home className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        {t("home")}
      </Link>
      <ul>
        {NAV.map((item) => {
          const expanded = open[item.i18n] ?? groupOpen(pathname, item.href, item.children);
          const hasChildren = Boolean(item.children?.length);
          return (
            <li key={item.i18n} className="select-none">
              <button
                type="button"
                aria-expanded={hasChildren ? expanded : undefined}
                onClick={() => {
                  if (!hasChildren) return;
                  setOpen((prev) => ({ ...prev, [item.i18n]: !expanded }));
                }}
                className={cn(
                  "flex w-full items-center gap-1 rounded-md px-1 py-1 text-left hover:bg-accent",
                  groupOpen(pathname, item.href, item.children) && !item.children?.some((c) => isActive(pathname, c.href))
                    ? "text-primary"
                    : "text-foreground",
                )}
              >
                <ChevronRight
                  className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-90")}
                  aria-hidden
                />
                {expanded ? (
                  <FolderOpen className="size-3.5 shrink-0 text-primary" aria-hidden />
                ) : (
                  <Folder className="size-3.5 shrink-0 text-primary/80" aria-hidden />
                )}
                <span className="truncate font-medium">{t(item.i18n)}</span>
              </button>
              {hasChildren && expanded ? (
                <ul className="ml-3 border-l border-border py-0.5 pl-2">
                  {item.children!.map((child) => {
                    const current = isActive(pathname, child.href);
                    return (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={onNavigate}
                          aria-current={current ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-accent",
                            current && "bg-accent font-medium text-primary",
                          )}
                        >
                          <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
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
