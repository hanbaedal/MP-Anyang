import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { listNotices } from "@/lib/notices";

export const metadata = { title: "공지사항" };
export const revalidate = 60;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(date);
}

export default async function NoticesPage() {
  const notices = await listNotices();

  return (
    <>
      <PageHero kicker="고객센터" title="공지사항" lead="명절 교통, 벌초, 휴무처럼 지금 필요한 글만 올립니다." />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {notices.length === 0 ? (
          <p className="text-muted-foreground">등록된 공지가 없습니다. 급하신 일은 031-482-2949로 전화 주세요.</p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {notices.map((notice) => (
              <li key={notice.slug}>
                <Link href={`/support/notices/${notice.slug}`} className="flex flex-col gap-1 px-4 py-4 hover:bg-accent md:flex-row md:items-center md:justify-between">
                  <span className="font-medium text-primary">
                    {notice.pinned ? <span className="mr-2 text-xs text-ring">고정</span> : null}
                    {notice.title}
                  </span>
                  <time className="text-sm text-muted-foreground" dateTime={notice.publishedAt}>
                    {formatDate(notice.publishedAt)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
