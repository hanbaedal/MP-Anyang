import { createConsult } from "../../../lib/store";

async function submitConsult(formData: FormData) {
  "use server";
  await createConsult({
    name: String(formData.get("name") || ""),
    phone: String(formData.get("phone") || ""),
    lotType: String(formData.get("lotType") || ""),
    message: String(formData.get("message") || ""),
  });
}

export default function ConsultPage() {
  return (
    <article className="article">
      <p className="kicker">서비스</p>
      <h1>상담신청</h1>
      <p className="lead">분양, 상조, 리모델링 상담을 남겨 주시면 담당자가 연락드립니다.</p>
      <form action={submitConsult} className="panel form-grid">
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
          <select name="lotType" defaultValue="봉안묘">
            <option>봉안묘</option>
            <option>수목장</option>
            <option>매장묘</option>
            <option>평장묘</option>
            <option>상조</option>
            <option>리모델링</option>
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
