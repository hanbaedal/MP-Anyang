"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ADMIN_MENU, MENU, adminNavActive, groupIdFromPath, memorialNavActive } from "../lib/menu";
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

const slogan = "추억과 그리움이 머무는 자리, 안양공원묘원";

export function SiteShell({ children, userName, userRole }: Props) {
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

  return (
    <div className="shell">
      <header className="site-header">
        <div className="logo">
          <button className="btn icon-btn menu-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label="메뉴 열기">
            ≡
          </button>
          <Link href="/" className="logo-link" aria-label="안양공원묘원 메인으로 이동">
            <LogoMark />
            <div className="logo-text">
              <strong>안양공원묘원</strong>
              <span>ANYANG MEMORIAL PARK</span>
            </div>
          </Link>
        </div>
        <p className="slogan">{slogan}</p>
        <div className="header-actions">
          {loggedIn ? (
            <>
              {activeUserRole === "member" ? (
                <Link className="btn btn-sm" href="/mypage">내정보</Link>
              ) : activeUserRole === "admin" ? (
                <Link className="btn btn-sm" href="/admin">사이트맵</Link>
              ) : null}
              <span className="meta">{activeUserName}</span>
              <button className="btn" onClick={onLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <Link className="btn" href="/login">
              로그인
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
                {group.label}
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
                          {child.label}
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
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {activeUserRole === "admin" && (
            <div className="nav-group admin-nav">
              <div className="nav-group-btn static">관리자</div>
              <div className="nav-children">
                {ADMIN_MENU.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`nav-link ${adminNavActive(pathname, child.href) ? "active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
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
              <p className="footer-name">안양공원묘원</p>
              <p>경기도 의왕시 청계동 산 8-5 일원</p>
              <p>관리사무실: 031-421-9165 | 긴급연락: 010-9111-0107</p>
              <p>운영시간: 매일 08:00 – 18:00 (동절기 08:00 – 17:30)</p>
              <p className="footer-copy">&copy; {new Date().getFullYear()} 안양공원묘원. All rights reserved.</p>
            </div>
          </footer>
        </main>
      </div>

      <SideCta loggedIn={loggedIn} />
    </div>
  );
}
