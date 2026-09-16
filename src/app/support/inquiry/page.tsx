import { InquiryForm } from "@/components/inquiry-form";
import { PageHero, Prose } from "@/components/page-hero";
import { SITE } from "@/lib/site";

export const metadata = { title: "문의·상담" };
export const dynamic = "force-dynamic";

export default function InquiryPage() {
  return (
    <>
      <PageHero
        kicker="고객센터"
        title="문의·상담"
        lead="전화가 가장 빠릅니다. 자리를 비우셨을 때는 이름·연락처·내용을 남겨 주세요."
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1fr_1.1fr]">
        <Prose>
          <h2 className="text-xl">전화</h2>
          <p>
            <a className="text-lg font-medium text-primary" href={SITE.phoneTel}>
              {SITE.phone}
            </a>
          </p>
          <p>{SITE.address}</p>
          <p className="text-sm text-muted-foreground">
            상담 시간은 확인되는 대로 적겠습니다. 지금은 임의 숫자를 넣지 않습니다.
          </p>
        </Prose>
        <InquiryForm />
      </div>
    </>
  );
}
