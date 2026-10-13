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
        lead="답변은 홈페이지 문의 목록에 표시됩니다. 「문자보내기」는 저장+문자, 「완료」는 저장만 합니다."
      />
      <ManageInquiries initial={items} />
    </>
  );
}
