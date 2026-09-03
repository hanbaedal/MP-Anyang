"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MENU, groupIdFromPath } from "../lib/menu";
import { ChatIcon, Chevron, LogoMark, SearchIcon } from "./icons";

type Props = {
  children: React.ReactNode;
  userName?: string;
};

const slogan = "추억과 그리움이 머무는 자리, 안양공원묘지";

function SocialBar({ light = false }: { light?: boolean }) {
  return (
    <div className={`sns-bar ${light ? "light" : ""}`}>
      <a href="#" aria-label="페이스북">
        f
      </a>
      <a href="#" aria-label="인스타그램">
        ◎
      </a>
      <a href="#" aria-label="유튜브">
        ▶
      </a>
      <a href="#" aria-label="네이버카페">
        N
      </a>
    </div>
  );
}

export function SiteShell({ children, userName }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeGroup = useMemo(() => groupIdFromPath(pathname), [pathname]);
  const [opened, setOpened] = useState<Record<string, boolean>>(
    () => Object.fromEntries(MENU.map((group) => [group.id, group.id === activeGroup])),
  );

  const onLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <div className="shell">
      <header className="site-header">
        <div className="logo">
          <button className="btn icon-btn menu-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label="메뉴 열기">
            ≡
          </button>
          <LogoMark />
          <div className="logo-text">
            <strong>안양공원묘지</strong>
            <span>ANYANG MEMORIAL PARK</span>
          </div>
        </div>
        <p className="slogan">{slogan}</p>
        <div className="header-actions">
          {userName ? (
            <>
              <span className="meta">{userName}</span>
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
                  {group.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`nav-link ${pathname === child.href ? "active" : ""}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>
        <button className={`drawer-backdrop ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(false)} />

        <main className="content">
          {children}
          <footer className="page-footer">
            <SocialBar light />
          </footer>
        </main>
      </div>

      <div className="floating">
        <Link href="/consult" className="btn consult">
          <ChatIcon /> 상담신청
        </Link>
        <Link href="/grave-search" className="btn">
          <SearchIcon /> 묘역찾기
        </Link>
      </div>
    </div>
  );
}
