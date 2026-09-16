import { PageHero, Prose } from "@/components/page-hero";
import { GREETING, SITE } from "@/lib/site";

export const metadata = { title: "인사말" };

export default function GreetingPage() {
  return (
    <>
      <PageHero kicker="공원소개" title="인사말" lead="고인을 모시는 자리가 가족에게도 부담 없는 길이기를 바랍니다." image={{ src: "/images/hero.jpg", alt: "공원 전경" }} />
      <article className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          {GREETING.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p>감사합니다.</p>
          <p className="font-medium text-primary">{SITE.shortName}묘원 임직원 일동</p>
        </Prose>
      </article>
    </>
  );
}
