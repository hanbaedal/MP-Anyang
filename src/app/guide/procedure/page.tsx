import Link from "next/link";
import { PageHero, Prose } from "@/components/page-hero";
import { SaleSteps } from "@/components/sale-steps";
import { SITE } from "@/lib/site";

export const metadata = { title: "분양 절차" };

export default function ProcedurePage() {
  return (
    <>
      <PageHero
        kicker="이용안내"
        title="분양 절차"
        lead="안양공원묘원 청약서로 진행합니다. 분양가의 몇 퍼센트라는 말은 쓰지 않습니다."
      />
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <SaleSteps />
        <Prose>
          <p>
            상담은{" "}
            <a className="text-primary underline-offset-4 hover:underline" href={SITE.phoneTel}>
              {SITE.phone}
            </a>
            또는{" "}
            <Link href="/support/inquiry" className="text-primary underline-offset-4 hover:underline">
              문의 양식
            </Link>
            으로 받습니다. 입금 계좌는 사이트에 공개하지 않고, 청약 뒤 사무실에서 알려 드립니다.
          </p>
          <p>자리를 쓰실 때는 사용 희망일 2일 전 관리사무실에 알려 주세요.</p>
        </Prose>
      </div>
    </>
  );
}
