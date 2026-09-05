import Link from "next/link";
import { requireAdmin } from "../../../lib/auth";
import { ADMIN_MENU, MENU } from "../../../lib/menu";

const ADMIN_CARD_DESC: Record<string, string> = {
  "/admin/members": "회원 목록 · 검색 · 수정 · 삭제",
  "/admin/graves": "묘역 등록 · 사진 · 명절 점검",
  "/admin/park": "묘역찾기 모달용 공원 풍광",
};

const QUICK_LINKS = [
  { href: "/", label: "메인" },
  { href: "/grave-search", label: "묘역찾기" },
  { href: "/consult", label: "상담신청" },
];

export default async function AdminSiteMapPage() {
  await requireAdmin();
  const supportGroup = MENU.find((group) => group.id === "support");

  return (
    <article className="article admin-sitemap-page">
      <p className="kicker">관리자</p>
      <h1>사이트맵</h1>
      <p className="lead">운영 메뉴와 공개 페이지를 한곳에서 확인합니다.</p>

      <section className="sitemap-section">
        <h2>운영 관리</h2>
        <div className="cards-3">
          {ADMIN_MENU.filter((item) => item.href !== "/admin").map((item) => (
            <Link key={item.href} href={item.href} className="card card-link">
              <h3>{item.label}</h3>
              <p>{ADMIN_CARD_DESC[item.href] || ""}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="sitemap-section">
        <h2>주요 바로가기</h2>
        <ul className="sitemap-link-list">
          {QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </section>

      {supportGroup ? (
        <section className="sitemap-section">
          <h2>{supportGroup.label}</h2>
          <ul className="sitemap-link-list">
            {supportGroup.children.map((child) => (
              <li key={child.href}>
                <Link href={child.href}>{child.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="sitemap-section">
        <h2>공개 페이지 미리보기</h2>
        <p className="meta sitemap-note">방문자 화면 확인용 · 새 탭에서 열립니다.</p>
        <div className="sitemap-groups">
          {MENU.map((group) => (
            <div key={group.id} className="sitemap-group card">
              <h3>{group.label}</h3>
              <ul className="sitemap-link-list">
                {group.children.map((child) => (
                  <li key={child.href}>
                    <Link href={child.href} target="_blank" rel="noopener noreferrer">
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
