import { PageHero } from "@/components/page-hero";
import { ManageAdmins } from "@/components/manage-admins";
import { requireStaff } from "@/lib/auth";
import { listStaff, publicStaff } from "@/lib/staff";

export default async function ManageAdminsPage() {
  await requireStaff(true);
  const items = (await listStaff()).map(publicStaff);
  return (
    <>
      <PageHero kicker="관리" title="관리자 계정" lead="감독만 관리자 아이디와 비밀번호를 만듭니다. 비밀번호는 bcrypt로 저장합니다." />
      <ManageAdmins initial={items} />
    </>
  );
}
