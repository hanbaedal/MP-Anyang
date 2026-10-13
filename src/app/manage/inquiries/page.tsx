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
        lead="답변은 홈페이지 문의 목록에 항상 표시됩니다. 문자는 답변 시 선택한 경우에만 보냅니다(발신 010-5149-2949)."
      />
      <ManageInquiries initial={items} />
    </>
  );
}
