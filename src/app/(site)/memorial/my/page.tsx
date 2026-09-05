import { redirect } from "next/navigation";
import { MEMORIAL_MY_HALL } from "../../../../lib/memorial-demo";

/** /memorial/my 북마크 호환 — 목록 없이 데모 추모관으로 이동 */
export default function MemorialMyRedirectPage() {
  redirect(`/memorial/${MEMORIAL_MY_HALL}`);
}
