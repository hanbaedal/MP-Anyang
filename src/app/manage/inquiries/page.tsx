import { PageHero } from "@/components/page-hero";
import { ManageInquiries } from "@/components/manage-inquiries";
import { listInquiries } from "@/lib/inquiries";

export default async function ManageInquiriesPage() {
  const items = await listInquiries();
  return (
    <>
      <PageHero kicker="관리" title="문의" lead="답변은 관리 메모입니다. 민원인 메일 발송은 없습니다." />
      <ManageInquiries initial={items} />
    </>
  );
}
