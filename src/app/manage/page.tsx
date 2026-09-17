import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { CMS_SLUGS } from "@/lib/cms-types";
import { listInquiries } from "@/lib/inquiries";
import { requireCmsStaff } from "@/lib/auth";

export default async function ManageHomePage() {
  const session = await requireCmsStaff();
  const inquiries = await listInquiries();
  const pending = inquiries.filter((item) => item.status !== "answered").length;

  return (
    <>
      <PageHero
        kicker="관리"
        title="사이트 관리"
        lead={`${session.name} 님(${session.role === "supervisor" ? "감독" : "관리자"}) · 공개 화면의 글과 사진을 고칩니다.`}
      />
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {CMS_SLUGS.map((item) => (
          <Link key={item.slug} href={`/manage/pages/${item.slug}`} className="rounded-xl border bg-card p-5 shadow-sm hover:bg-accent">
            <h2 className="font-medium">{item.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">본문·항목을 수정합니다.</p>
          </Link>
        ))}
        <Link href="/manage/gallery" className="rounded-xl border bg-card p-5 shadow-sm hover:bg-accent">
          <h2 className="font-medium">갤러리 사진</h2>
          <p className="mt-1 text-sm text-muted-foreground">올리고 고치고 지웁니다. Render 재배포 시 업로드 파일은 사라질 수 있습니다.</p>
        </Link>
        <Link href="/manage/notices" className="rounded-xl border bg-card p-5 shadow-sm hover:bg-accent">
          <h2 className="font-medium">공지사항</h2>
          <p className="mt-1 text-sm text-muted-foreground">글을 등록·수정·삭제합니다.</p>
        </Link>
        <Link href="/manage/inquiries" className="rounded-xl border bg-card p-5 shadow-sm hover:bg-accent">
          <h2 className="font-medium">문의 목록</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            미답변 {pending}건. 답변은 관리 메모이며 메일로 보내지 않습니다.
          </p>
        </Link>
        <Link href="/manage/faq" className="rounded-xl border bg-card p-5 shadow-sm hover:bg-accent">
          <h2 className="font-medium">묻고답하기</h2>
          <p className="mt-1 text-sm text-muted-foreground">공개 목록용 질문·답을 직접 올립니다.</p>
        </Link>
        {session.role === "supervisor" ? (
          <Link href="/manage/admins" className="rounded-xl border bg-card p-5 shadow-sm hover:bg-accent">
            <h2 className="font-medium">관리자 계정</h2>
            <p className="mt-1 text-sm text-muted-foreground">감독만 관리자 아이디를 만듭니다.</p>
          </Link>
        ) : null}
      </div>
    </>
  );
}
