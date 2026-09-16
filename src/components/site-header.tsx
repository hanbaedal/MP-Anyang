"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, MapPin } from "lucide-react";
import { NAV, SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function sectionActive(pathname: string, href: string, children?: { href: string }[]) {
  if (isActive(pathname, href)) return true;
  return children?.some((child) => isActive(pathname, child.href)) ?? false;
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-[color:var(--card)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:py-4">
        <Link href="/" className="min-w-0 shrink">
          <p className="font-serif text-lg leading-tight text-primary md:text-xl">{SITE.legalName}</p>
          <p className="truncate text-xs text-muted-foreground">{SITE.region}</p>
        </Link>

        <nav className="ml-6 hidden flex-1 items-center gap-1 lg:flex" aria-label="주요 메뉴">
          {NAV.map((item) => (
            <div key={item.label} className="group relative">
              <Link
                href={item.href}
                className={cn(
                  "inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary",
                  sectionActive(pathname, item.href, item.children) && "text-primary",
                )}
              >
                {item.label}
              </Link>
              {item.children ? (
                <div className="absolute left-0 top-full z-20 hidden min-w-44 pt-1 group-hover:block group-focus-within:block">
                  <div className="rounded-md border bg-card py-2 shadow-md">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-primary",
                          isActive(pathname, child.href) && "text-primary",
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={SITE.phoneTel}>
              <Phone />
              {SITE.phone}
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
            <Link href="/intro/directions">
              <MapPin />
              오시는 길
            </Link>
          </Button>
          <Button asChild size="icon" className="sm:hidden" aria-label="전화 걸기">
            <a href={SITE.phoneTel}>
              <Phone />
            </a>
          </Button>
          <Button asChild size="icon" variant="outline" className="sm:hidden" aria-label="오시는 길">
            <Link href="/intro/directions">
              <MapPin />
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="lg:hidden" aria-label="메뉴 열기">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="font-serif text-left">{SITE.legalName}</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-4 px-4 pb-8">
                <SheetClose asChild>
                  <Link href="/" className="text-sm font-medium text-primary">
                    홈
                  </Link>
                </SheetClose>
                {NAV.map((item) => (
                  <div key={item.label}>
                    <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {item.label}
                    </p>
                    {item.children ? (
                      <div className="flex flex-col">
                        {item.children.map((child) => (
                          <SheetClose asChild key={child.href}>
                            <Link href={child.href} className="rounded-md py-2 text-sm hover:text-primary">
                              {child.label}
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    ) : (
                      <SheetClose asChild>
                        <Link href={item.href} className="rounded-md py-2 text-sm hover:text-primary">
                          {item.label}
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                ))}
                <a href={SITE.phoneTel} className="text-sm font-medium text-primary">
                  전화 {SITE.phone}
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
