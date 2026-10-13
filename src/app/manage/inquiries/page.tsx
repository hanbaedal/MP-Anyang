import { PageHero } from "@/components/page-hero";
import { ManageInquiries } from "@/components/manage-inquiries";
import { listInquiries } from "@/lib/inquiries";

export default async function ManageInquiriesPage() {
  const items = await listInquiries();
  return (
    <>
      <PageHero
        kicker="관리"
        title="문의"
        lead="답변을 저장하면 문의 스마트폰으로 솔라피 문자가 갑니다. 발신번호는 010-5149-2949입니다."
      />
      <ManageInquiries initial={items} />
    </>
  );
}
