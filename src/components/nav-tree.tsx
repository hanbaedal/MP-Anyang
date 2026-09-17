"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, ChevronRight, FileText, Folder, FolderOpen, Home, LayoutTemplate, Map } from "lucide-react";
import { NAV } from "@/lib/site";
import { WORK_NAV } from "@/lib/work-nav";
import { EXEC_NAV } from "@/lib/exec-nav";
import { manageNavItems, MANAGE_HOME } from "@/lib/manage-nav";
import { cn } from "@/lib/utils";
import { useT } from "@/components/locale-provider";
import { isCmsStaff, isStatusStaff, isStaffRole, type Role } from "@/lib/auth-types";

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/account")) return pathname === "/account" || pathname.startsWith("/account/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupOpen(pathname: string, href: string, children?: { href: string }[]) {
  if (children?.some((child) => isNavActive(pathname, child.href))) return true;
  return isNavActive(pathname, href);
}

const topLevelLi = "mb-5 border-b border-border select-none";

export function NavTree({
  onNavigate,
  fit,
  role,
}: {
  onNavigate?: () => void;
  fit?: boolean;
  role?: Role | null;
}) {
  const row = cn(
    "flex h-6 items-center gap-0.5 px-1 text-left hover:bg-accent",
    fit ? "w-max max-w-full whitespace-nowrap" : "w-full",
  );
  const pathname = usePathname();
  const t = useT();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const staff = isStaffRole(role);
  const cms = isCmsStaff(role);
  const workOpenDefault = staff;
  const execOpenDefault = isStatusStaff(role);
  const manageOpenDefault = cms;

  useEffect(() => {
    setOpen((prev) => {
      const next = { ...prev };
      for (const item of NAV) {
        if (item.children?.length && groupOpen(pathname, item.href, item.children)) {
          next[item.i18n] = true;
        }
      }
      if (workOpenDefault) next.work = true;
      if (execOpenDefault) next.exec = true;
      if (manageOpenDefault) next.manage = true;
      return next;
    });
  }, [pathname, workOpenDefault, execOpenDefault, manageOpenDefault]);

  const workExpanded = open.work ?? workOpenDefault;
  const execExpanded = open.exec ?? execOpenDefault;
  const manageExpanded = open.manage ?? manageOpenDefault;
  const manageLinks = cms && role ? manageNavItems(role) : [];

  return (
    <nav aria-label={t("explorer")} className={cn("text-[12px] leading-none", fit && "w-max")}>
      <Link
        href="/"
        onClick={onNavigate}
        className={cn(row, "border-b border-border", pathname === "/" && "bg-accent font-medium text-primary")}
      >
        <Home className="size-3 shrink-0 text-muted-foreground" aria-hidden />
        <span className={cn(!fit && "truncate")}>{t("home")}</span>
      </Link>
      <ul>
        {NAV.map((item) => {
          const hasChildren = Boolean(item.children?.length);
          const expanded = open[item.i18n] ?? groupOpen(pathname, item.href, item.children);
          const currentLeaf = !hasChildren && isNavActive(pathname, item.href);

          return (
            <li key={item.i18n} className={topLevelLi}>
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
                  <span className={cn("font-medium", !fit && "truncate")}>{t(item.i18n)}</span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={currentLeaf ? "page" : undefined}
                  className={cn(row, currentLeaf && "bg-accent font-medium text-primary")}
                >
                  <Map className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                  <span className={cn("font-medium", !fit && "truncate")}>{t(item.i18n)}</span>
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
                          className={cn(row, "pl-5", current && "bg-accent font-medium text-primary")}
                        >
                          <FileText className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                          <span className={cn(!fit && "truncate")}>{t(child.i18n)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
        {staff ? (
          <li className={topLevelLi}>
            <button
              type="button"
              aria-expanded={workExpanded}
              onClick={() => setOpen((prev) => ({ ...prev, work: !workExpanded }))}
              className={cn(row, workOpenDefault && "text-primary")}
            >
              <ChevronRight
                className={cn("size-3 shrink-0 text-muted-foreground transition-transform", workExpanded && "rotate-90")}
                aria-hidden
              />
              {workExpanded ? (
                <FolderOpen className="size-3 shrink-0 text-primary" aria-hidden />
              ) : (
                <Briefcase className="size-3 shrink-0 text-primary/80" aria-hidden />
              )}
              <span className={cn("font-medium", !fit && "truncate")}>{t("work.program")}</span>
            </button>
            {workExpanded ? (
              <ul className="border-t border-border">
                {WORK_NAV.map((child) => {
                  const current = isNavActive(pathname, child.href);
                  return (
                    <li key={child.href} className="border-b border-border last:border-b-0">
                      <Link
                        href={child.href}
                        onClick={onNavigate}
                        aria-current={current ? "page" : undefined}
                        className={cn(row, "pl-5", current && "bg-accent font-medium text-primary")}
                      >
                        <FileText className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                        <span className={cn(!fit && "truncate")}>{t(child.i18n)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </li>
        ) : null}
        {isStatusStaff(role) ? (
          <li className={topLevelLi}>
            <button
              type="button"
              aria-expanded={execExpanded}
              onClick={() => setOpen((prev) => ({ ...prev, exec: !execExpanded }))}
              className={cn(row, execOpenDefault && "text-primary")}
            >
              <ChevronRight
                className={cn("size-3 shrink-0 text-muted-foreground transition-transform", execExpanded && "rotate-90")}
                aria-hidden
              />
              {execExpanded ? (
                <FolderOpen className="size-3 shrink-0 text-primary" aria-hidden />
              ) : (
                <Folder className="size-3 shrink-0 text-primary/80" aria-hidden />
              )}
              <span className={cn("font-medium", !fit && "truncate")}>{t("work.overview")}</span>
            </button>
            {execExpanded ? (
              <ul className="border-t border-border">
                {EXEC_NAV.map((child) => {
                  const current = isNavActive(pathname, child.href);
                  return (
                    <li key={child.href} className="border-b border-border last:border-b-0">
                      <Link
                        href={child.href}
                        onClick={onNavigate}
                        aria-current={current ? "page" : undefined}
                        className={cn(row, "pl-5", current && "bg-accent font-medium text-primary")}
                      >
                        <FileText className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                        <span className={cn(!fit && "truncate")}>{t(child.i18n)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </li>
        ) : null}
        {cms ? (
          <li className={topLevelLi}>
            <button
              type="button"
              aria-expanded={manageExpanded}
              onClick={() => setOpen((prev) => ({ ...prev, manage: !manageExpanded }))}
              className={cn(row, manageOpenDefault && "text-primary")}
            >
              <ChevronRight
                className={cn("size-3 shrink-0 text-muted-foreground transition-transform", manageExpanded && "rotate-90")}
                aria-hidden
              />
              {manageExpanded ? (
                <FolderOpen className="size-3 shrink-0 text-primary" aria-hidden />
              ) : (
                <LayoutTemplate className="size-3 shrink-0 text-primary/80" aria-hidden />
              )}
              <span className={cn("font-medium", !fit && "truncate")}>{t("manage.homepage")}</span>
            </button>
            {manageExpanded ? (
              <ul className="border-t border-border">
                {manageLinks.map((child) => {
                  const current = isNavActive(pathname, child.href);
                  return (
                    <li key={child.href} className="border-b border-border last:border-b-0">
                      <Link
                        href={child.href}
                        onClick={onNavigate}
                        aria-current={current ? "page" : undefined}
                        className={cn(row, "pl-5", current && "bg-accent font-medium text-primary")}
                      >
                        <FileText className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                        <span className={cn(!fit && "truncate")}>{t(child.i18n)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </li>
        ) : null}
        {role === "supervisor" ? (
          <li className={topLevelLi}>
            <Link
              href="/work/sync"
              onClick={onNavigate}
              aria-current={pathname.startsWith("/work/sync") ? "page" : undefined}
              className={cn(row, pathname.startsWith("/work/sync") && "bg-accent font-medium text-primary")}
            >
              <Map className="size-3 shrink-0 text-muted-foreground" aria-hidden />
              <span className={cn("font-medium", !fit && "truncate")}>{t("work.dbUpdate")}</span>
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
