"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FlagSwitcher } from "@/components/flag-switcher";
import { NavTree } from "@/components/nav-tree";
import { useT } from "@/components/locale-provider";

export function SiteHeader() {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <header className="z-40 h-12 shrink-0 border-b border-border/80 bg-[color:var(--card)]/95 backdrop-blur">
      <div className="flex h-full items-center gap-2 px-2 sm:px-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon-sm" variant="outline" className="lg:hidden" aria-label={t("menu")}>
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" showCloseButton={false} className="flex w-56 flex-col gap-0 bg-card p-0 sm:max-w-56">
            <SheetHeader className="flex-row items-center justify-between space-y-0 border-b p-1.5">
              <SheetTitle className="font-serif text-left text-sm">{t("explorer")}</SheetTitle>
              <SheetClose asChild>
                <Button size="icon-sm" variant="ghost" aria-label={t("close")}>
                  <X />
                </Button>
              </SheetClose>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
              <NavTree onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="min-w-0 shrink">
          <p className="truncate font-serif text-base leading-none text-primary sm:text-lg">{SITE.legalName}</p>
        </Link>

        <div className="ml-auto">
          <FlagSwitcher />
        </div>
      </div>
    </header>
  );
}
