"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ADMIN_MENU, MENU, groupIdFromPath } from "../lib/menu";
import { ChatIcon, Chevron, LogoMark, MemorialIcon, SearchIcon } from "./icons";
import { SocialBar } from "./SocialBar";

type Props = {
  children: React.ReactNode;
  userName?: string;
  userRole?: "admin" | "member";
};

const slogan = "추억과 그리움이 머무는 자리, 안양공원묘지";

function adminNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteShell({ children, userName, userRole }: Props) {
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
          <Link href="/" className="logo-link" aria-label="안양공원묘지 메인으로 이동">
            <LogoMark />
            <div className="logo-text">
              <strong>안양공원묘지</strong>
              <span>ANYANG MEMORIAL PARK</span>
            </div>
          </Link>
        </div>
        <p className="slogan">{slogan}</p>
        <div className="header-actions">
          {userName ? (
            <>
              {userRole === "member" ? (
                <Link className="btn btn-sm" href="/mypage">내정보</Link>
              ) : userRole === "admin" ? (
                <Link className="btn btn-sm" href="/admin">사이트맵</Link>
              ) : null}
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

          {userRole === "admin" && (
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
              <p className="footer-name">안양공원묘지</p>
              <p>경기도 의왕시 청계동 산 8-5 일원</p>
              <p>관리사무실: 031-421-9165 | 긴급연락: 010-9111-0107</p>
              <p>운영시간: 매일 08:00 – 18:00 (동절기 08:00 – 17:30)</p>
              <p className="footer-copy">&copy; {new Date().getFullYear()} 안양공원묘지. All rights reserved.</p>
            </div>
          </footer>
        </main>
      </div>

      {/* 우측 중간 고정 사이드 버튼 */}
      <div className="side-cta">
        <Link href="/consult" className="side-cta-btn primary">
          <ChatIcon /><span>상담신청</span>
        </Link>
        <Link href="/grave-search" className="side-cta-btn">
          <SearchIcon /><span>묘역찾기</span>
        </Link>
        <Link href="/memorial" className="side-cta-btn memorial">
          <MemorialIcon /><span>사이버 추모관</span>
        </Link>
      </div>
    </div>
  );
}
