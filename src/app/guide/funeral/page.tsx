import { PageHero, Prose } from "@/components/page-hero";
import { SITE } from "@/lib/site";

export const metadata = { title: "장례·안치" };

export default function FuneralPage() {
  return (
    <>
      <PageHero
        kicker="이용안내"
        title="장례·안치"
        lead="별세 뒤에는 바로 전화로 접수해 주시고, 안치(입실)를 원하는 날의 2일 전까지 사무실에 일정을 알려 주세요."
      />
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <ol className="grid gap-4 md:grid-cols-4">
          {[
            { n: "1", t: "안치 접수", d: `돌아가신 뒤 ${SITE.phone}으로 접수합니다.` },
            { n: "2", t: "공원 도착", d: "필요 서류를 제출합니다." },
            { n: "3", t: "고인 안치", d: "분양 자리를 확인한 뒤 안치합니다." },
            { n: "4", t: "비석 각자", d: "비석 각자는 별도로 신청합니다." },
          ].map((step) => (
            <li key={step.n} className="rounded-xl border bg-card p-4">
              <p className="text-sm text-primary">{step.n}</p>
              <h2 className="mt-1 text-lg">{step.t}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{step.d}</p>
            </li>
          ))}
        </ol>
        <div className="grid gap-8 md:grid-cols-2">
          <Prose>
            <h2 className="text-xl">매장 시 서류</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>사망진단서 1부</li>
              <li>고인 포함 가족관계증명서 또는 제적등본 1부</li>
              <li>연고자 신분증</li>
              <li>검사지위서 1부(사고사인 경우)</li>
            </ul>
          </Prose>
          <Prose>
            <h2 className="text-xl">화장 시 서류</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>사망진단서 1부</li>
              <li>화장증명서 1부</li>
              <li>고인 포함 가족관계증명서 또는 제적등본 1부</li>
              <li>검사지위서 1부(사고사인 경우)</li>
            </ul>
          </Prose>
        </div>
        <Prose>
          <p>
            사용 희망일 2일 전 사무실 통보는 분양·사용 안내와 같습니다. 개장 절차는{" "}
            <a className="text-primary underline-offset-4 hover:underline" href="/guide/services">
              서비스
            </a>
            페이지의 이장·개장을 보세요.
          </p>
        </Prose>
      </div>
    </>
  );
}
