import { PageHero, Prose } from "@/components/page-hero";
import { SITE } from "@/lib/site";

export const metadata = { title: "개인정보처리방침" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero kicker="안내" title="개인정보처리방침" lead="문의 양식을 운영하므로 아래 기준으로 처리합니다." />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          <p>
            {SITE.legalName}(이하 재단)은 홈페이지 문의 상담을 위해 이름, 연락처, 문의 내용을 받습니다. 분양·관리·장례 안내 외의 목적으로 쓰지 않습니다.
          </p>
          <p>수집 항목은 이름, 연락처, 문의 내용, 접수 시각입니다. 법정 의무가 없으면 상담이 끝난 뒤 지체 없이 파기합니다.</p>
          <p>
            문의 내용은 관리사무실에서 열람합니다. 법령에 따른 경우를 제외하고 제3자에게 제공하지 않습니다. 처리 위탁이 생기면 이 페이지에 밝힙니다.
          </p>
          <p>
            열람·정정·삭제는 {SITE.phone}으로 요청하실 수 있습니다. 개인정보 보호 책임은 관리사무실이 맡습니다.
          </p>
        </Prose>
      </div>
    </>
  );
}
