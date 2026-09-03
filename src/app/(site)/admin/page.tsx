import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "../../../lib/auth";

export default async function AdminHomePage() {
  await requireAdmin();
  return (
    <article className="article">
      <p className="kicker">관리자</p>
      <h1>관리자 메뉴</h1>
      <div className="cards-3">
        <Link href="/admin/members" className="card card-link">
          <h2>회원 관리</h2>
          <p>회원 목록 · 수정 · 삭제 · 관리비 상태</p>
        </Link>
        <Link href="/admin/graves" className="card card-link">
          <h2>묘역 관리</h2>
          <p>묘역 CRUD · 사진 10장 · 명절 점검</p>
        </Link>
        <Link href="/admin/park" className="card card-link">
          <h2>공원 정보</h2>
          <p>공원 풍광 이미지 등록</p>
        </Link>
      </div>
    </article>
  );
}
