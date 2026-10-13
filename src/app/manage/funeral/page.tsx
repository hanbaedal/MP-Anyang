import { redirect } from "next/navigation";

/** 예전 경로 → CMS+PDF 통합 관리 */
export default function ManageFuneralRedirectPage() {
  redirect("/manage/pages/funeral");
}
