"use client";

import { NavTree } from "@/components/nav-tree";
import { useT } from "@/components/locale-provider";

export function SiteSidebar() {
  const t = useT();
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card lg:block">
      <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto px-3 py-3">
        <p className="mb-2 px-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{t("explorer")}</p>
        <NavTree />
      </div>
    </aside>
  );
}
