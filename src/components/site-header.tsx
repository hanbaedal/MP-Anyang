"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FlagSwitcher } from "@/components/flag-switcher";
import { NavTree } from "@/components/nav-tree";
import { useT } from "@/components/locale-provider";

export function SiteHeader() {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border/80 bg-[color:var(--card)]/95 backdrop-blur">
      <div className="flex h-full items-center gap-2 px-3 sm:px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="lg:hidden" aria-label={t("menu")}>
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-card p-0">
            <SheetHeader className="border-b">
              <SheetTitle className="font-serif text-left text-base">{t("explorer")}</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto px-3 py-3">
              <NavTree onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="min-w-0 shrink">
          <p className="truncate font-serif text-base leading-tight text-primary sm:text-lg">{SITE.legalName}</p>
        </Link>

        <div className="ml-auto">
          <FlagSwitcher />
        </div>
      </div>
    </header>
  );
}
