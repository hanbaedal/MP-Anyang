import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { readSession } from "../../../lib/auth";
import { createTicket } from "../../../lib/tickets";

async function submitConsult(formData: FormData) {
  "use server";
  const user = await readSession();
  await createTicket({
    name: String(formData.get("name") || ""),
    phone: String(formData.get("phone") || ""),
    category: String(formData.get("lotType") || ""),
    message: String(formData.get("message") || ""),
    source: (String(formData.get("source") || "consult") as "consult" | "side-cta" | "memorial"),
    userId: user?.id,
  });
  revalidatePath("/consult");
  revalidatePath("/admin/inquiries");
  redirect("/consult?ok=1");
}
export default async function ConsultPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; source?: string; type?: string }>;
}) {
  const { ok, source, type } = await searchParams;
  const lotDefault = type === "memorial" ? "추모 대행" : "봉안묘";
  const sourceValue = source || (type === "memorial" ? "memorial" : "consult");
  return (
    <article className="article">
      <p className="kicker">서비스</p>
      <h1>상담신청</h1>
      <p className="lead">분양, 상조, 추모, 리모델링 상담을 남겨 주시면 담당자가 연락드립니다.</p>
      <p className="meta">빠른 상담·추모 대행·문의사항 접수는 모두 동일하게 관리됩니다.</p>
      {ok === "1" && <p className="ok">상담 신청이 접수되었습니다. 담당자가 연락드리겠습니다.</p>}
      <form action={submitConsult} className="panel form-grid">
        <input type="hidden" name="source" value={sourceValue} />
        <label>
          신청자 이름
          <input name="name" required />
        </label>
        <label>
          연락처
          <input name="phone" required />
        </label>
        <label>
          상담 유형
          <select name="lotType" defaultValue={lotDefault}>
            <option>봉안묘</option>
            <option>수목장</option>
            <option>매장묘</option>
            <option>평장묘</option>
            <option>상조</option>
            <option>리모델링</option>
            <option>추모 대행</option>
          </select>
        </label>
        <label>
          문의 내용
          <textarea name="message" required />
        </label>
        <button className="btn btn-primary" type="submit">
          상담 접수
        </button>
      </form>
    </article>
  );
}
