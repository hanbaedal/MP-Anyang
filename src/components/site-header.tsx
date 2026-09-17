"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleUserRound, Menu, X } from "lucide-react";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FlagSwitcher } from "@/components/flag-switcher";
import { NavTree } from "@/components/nav-tree";
import { LoginModal } from "@/components/login-modal";
import { useT } from "@/components/locale-provider";
import { isCmsStaff, type Role } from "@/lib/auth-types";

export function SiteHeader({ signedIn, role }: { signedIn: boolean; role?: Role | null }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const cms = isCmsStaff(role);

  return (
    <header className="z-40 h-12 shrink-0 border-b border-border/80 bg-[color:var(--card)]/95 backdrop-blur">
      <div className="flex h-full min-w-0 items-center gap-1 px-1 sm:gap-2 sm:px-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon-xs" variant="outline" className="lg:hidden" aria-label={t("menu")}>
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="flex h-full w-max max-w-[90vw] flex-col gap-0 bg-card p-0 sm:max-w-[90vw]"
          >
            <SheetHeader className="w-max flex-row items-center gap-0.5 space-y-0 border-b p-1">
              <SheetTitle className="font-serif text-left text-xs leading-tight whitespace-nowrap">{t("explorer")}</SheetTitle>
              <SheetClose asChild>
                <Button size="icon-xs" variant="ghost" className="shrink-0" aria-label={t("close")}>
                  <X />
                </Button>
              </SheetClose>
            </SheetHeader>
            <div className="min-h-0 w-max flex-1 overflow-y-auto overscroll-y-contain">
              <NavTree fit role={role} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="shrink-0">
          <p className="whitespace-nowrap font-serif text-[11px] leading-none text-primary lg:text-lg">{SITE.legalName}</p>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-0">
          <FlagSwitcher />
          {cms ? (
            <Link
              href="/manage"
              className="rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-accent"
            >
              {t("header.manage")}
            </Link>
          ) : null}
          {signedIn ? (
            <Link
              href="/account"
              aria-label={t("account.myTitle")}
              title={t("account.myTitle")}
              className="inline-flex size-7 items-center justify-center rounded-md text-primary hover:bg-accent lg:size-9"
            >
              <CircleUserRound className="size-4 lg:size-5" aria-hidden />
            </Link>
          ) : (
            <LoginModal />
          )}
        </div>
      </div>
    </header>
  );
}
