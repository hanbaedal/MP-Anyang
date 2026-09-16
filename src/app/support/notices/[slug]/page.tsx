import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero, Prose } from "@/components/page-hero";
import { getNotice } from "@/lib/notices";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const notice = await getNotice(slug);
  const locale = await readLocale();
  return { title: notice?.title ?? t(locale, "notices.title") };
}

export default async function NoticeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const notice = await getNotice(slug);
  if (!notice) notFound();
  const locale = await readLocale();

  return (
    <>
      <PageHero kicker={t(locale, "notices.kicker")} title={notice.title} />
      <article className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          {notice.body.split("\n\n").map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Prose>
        <p className="mt-8 text-sm">
          <Link href="/support/notices" className="text-primary underline-offset-4 hover:underline">
            {t(locale, "listBack")}
          </Link>
        </p>
      </article>
    </>
  );
}
