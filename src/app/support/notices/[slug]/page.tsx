import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero, Prose } from "@/components/page-hero";
import { getNotice, listNotices } from "@/lib/notices";

export const revalidate = 60;

export async function generateStaticParams() {
  const notices = await listNotices();
  return notices.map((notice) => ({ slug: notice.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const notice = await getNotice(slug);
  return { title: notice?.title ?? "공지사항" };
}

export default async function NoticeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const notice = await getNotice(slug);
  if (!notice) notFound();

  return (
    <>
      <PageHero kicker="고객센터" title={notice.title} />
      <article className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          {notice.body.split("\n\n").map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Prose>
        <p className="mt-8 text-sm">
          <Link href="/support/notices" className="text-primary underline-offset-4 hover:underline">
            목록으로
          </Link>
        </p>
      </article>
    </>
  );
}
