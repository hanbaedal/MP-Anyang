"use client";

import { NavTree } from "@/components/nav-tree";
import { useT } from "@/components/locale-provider";

export function SiteSidebar() {
  const t = useT();
  return (
    <aside className="hidden h-full w-36 shrink-0 overflow-y-auto overflow-x-hidden overscroll-y-contain border-r bg-card lg:block">
      <p className="sticky top-0 z-10 border-b border-border bg-card px-1 py-1 text-[10px] font-medium leading-tight text-muted-foreground">
        {t("explorer")}
      </p>
      <NavTree />
    </aside>
  );
}
