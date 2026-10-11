import { PageHero } from "@/components/page-hero";
import { ManageFaq } from "@/components/manage-faq";
import { listFaq } from "@/lib/faq";

export default async function ManageFaqPage() {
  const items = await listFaq();
  return (
    <>
      <PageHero kicker="관리" title="묻고답하기" lead="공개 화면의 ‘질문 남기기’는 숨겼습니다. 여기서 질문·답을 올리면 목록에 나갑니다." />
      <ManageFaq initial={items} />
    </>
  );
}
