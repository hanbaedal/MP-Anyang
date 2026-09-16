import { PageHero, Prose } from "@/components/page-hero";

export const metadata = { title: "관리비" };

export default function FeesPage() {
  return (
    <>
      <PageHero
        kicker="이용안내"
        title="관리비"
        lead="잔디·벌초 등 신고한 관리 내역에 따른 금액입니다. 원 단위는 사이트에 올리지 않습니다."
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          <p>관리비는 계약일이 아니라 사용일을 기준으로 5년 선납입니다. 첫 납부 뒤 5년이 지나면 다시 5년 단위로 부과됩니다.</p>
          <p>은행 또는 공원 사무실에서 내실 수 있습니다. 무통장 입금, 자동이체, 신용카드 등 편하신 방법을 쓰시면 됩니다. 계좌번호는 공개하지 않습니다.</p>
          <p>연체된 관리비에는 연체율이 적용되니 납부일을 지켜 주세요. (보건복지부 지침)</p>
          <p>관리비는 이후 물가에 따라 달라질 수 있습니다.</p>
        </Prose>
      </div>
    </>
  );
}
