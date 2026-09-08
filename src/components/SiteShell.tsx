"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ADMIN_MENU, MENU, adminNavActive, groupIdFromPath, memorialNavActive } from "../lib/menu";
import { primeIntroAudio } from "../lib/intro-audio";
import { navKey } from "../lib/i18n";
import { SITE, telHref } from "../lib/site";
import { useI18n } from "./I18nProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MemorialMyLink } from "./MemorialMyLink";
import { SideCta } from "./SideCta";
import { Chevron, LogoMark } from "./icons";
import { SocialBar } from "./SocialBar";

type SessionUser = {
  id: string;
  username: string;
  name: string;
  role: "admin" | "member";
};

type Props = {
  children: React.ReactNode;
  userName?: string;
  userRole?: "admin" | "member";
};

function itemLabelKey(href: string) {
  return href === "/memorial" ? "nav.memorial.intro" : navKey(href);
}

export function SiteShell({ children, userName, userRole }: Props) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" })
      .then((res) => res.json())
      .then((data: { user: SessionUser | null }) => {
        if (!cancelled) setSessionUser(data.user);
      })
      .catch(() => {
        if (!cancelled) setSessionUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const activeUserName = sessionUser === undefined ? userName : sessionUser?.name;
  const activeUserRole = sessionUser === undefined ? userRole : sessionUser?.role;
  const loggedIn = Boolean(activeUserName);

  const activeGroup = useMemo(() => groupIdFromPath(pathname), [pathname]);
  const [opened, setOpened] = useState<Record<string, boolean>>(
    () => Object.fromEntries(MENU.map((group) => [group.id, group.id === activeGroup])),
  );

  const onLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setSessionUser(null);
    router.replace("/");
    router.refresh();
  };

  const goIntro = (e: React.MouseEvent) => {
    e.preventDefault();
    primeIntroAudio();
    router.push(`/?intro=1&r=${Date.now()}`);
  };

  return (
    <div className="shell">
      <header className="site-header">
        <div className="logo">
          <button className="btn icon-btn menu-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label={t("header.menu")}>
            ≡
          </button>
          <Link
            href="/?intro=1"
            className="logo-link"
            aria-label={t("header.intro")}
            onClick={goIntro}
          >
            <LogoMark />
            <div className="logo-text">
              <strong>{t("site.shortName")}</strong>
              <span>{t("site.logoSub")}</span>
            </div>
          </Link>
        </div>
        <p className="slogan">{t("header.slogan")}</p>
        <div className="header-actions">
          <LanguageSwitcher />
          {loggedIn ? (
            <>
              {activeUserRole === "member" ? (
                <Link className="btn btn-sm" href="/mypage">{t("header.mypage")}</Link>
              ) : activeUserRole === "admin" ? (
                <Link className="btn btn-sm" href="/admin">{t("header.sitemap")}</Link>
              ) : null}
              <span className="meta">{activeUserName}</span>
              <button className="btn" onClick={onLogout}>
                {t("header.logout")}
              </button>
            </>
          ) : (
            <Link className="btn" href="/login">
              {t("header.login")}
            </Link>
          )}
        </div>
      </header>

      <div className="shell-body">
        <aside className={`explorer ${mobileOpen ? "open" : ""}`}>
          <div className="explorer-title">
            <span>NAVIGATOR</span>
          </div>
          {MENU.map((group) => (
            <div key={group.id} className="nav-group">
              <button
                className="nav-group-btn"
                onClick={() => setOpened((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
              >
                <Chevron open={Boolean(opened[group.id])} />
                {t(`nav.${group.id}`)}
              </button>
              {opened[group.id] && (
                <div className="nav-children">
                  {group.children.map((child) => {
                    const active =
                      group.id === "memorial"
                        ? memorialNavActive(pathname, child.href)
                        : pathname === child.href;
                    if (child.href === "/memorial/my") {
                      return (
                        <MemorialMyLink
                          key={child.href}
                          loggedIn={loggedIn}
                          className={`nav-link ${active ? "active" : ""}`}
                          onNavigate={() => setMobileOpen(false)}
                        >
                          {t(itemLabelKey(child.href))}
                        </MemorialMyLink>
                      );
                    }
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`nav-link ${active ? "active" : ""}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {t(itemLabelKey(child.href))}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {activeUserRole === "admin" && (
            <div className="nav-group admin-nav">
              <div className="nav-group-btn static">{t("nav.admin")}</div>
              <div className="nav-children">
                {ADMIN_MENU.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`nav-link ${adminNavActive(pathname, child.href) ? "active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t(itemLabelKey(child.href))}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
        <button className={`drawer-backdrop ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(false)} />

        <main className="content">
          {children}
          <footer className="page-footer">
            <SocialBar light />
            <div className="footer-info">
              <p className="footer-name">{t("site.legalName")}</p>
              <p>{t("site.address")}</p>
              {locale !== "ko" ? (
                <p className="footer-official">
                  {SITE.legalName} · {SITE.addressShort}
                </p>
              ) : null}
              <p className="footer-home-hide">
                {t("footer.office")}: <a href={telHref()}>{SITE.phone}</a>
              </p>
              <p className="footer-home-hide">
                {t("footer.hours")}: {t("site.hoursDisplay")}
              </p>
              <p className="footer-copy footer-home-hide">&copy; {new Date().getFullYear()} {SITE.legalName}. All rights reserved.</p>
            </div>
          </footer>
        </main>
      </div>

      <SideCta loggedIn={loggedIn} />
    </div>
  );
}
