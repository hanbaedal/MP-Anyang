import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireUser } from "../../../lib/auth";
import { formatPhone } from "../../../lib/phone";
import { deleteMember, findUserById, toId, updateMember } from "../../../lib/store";
import type { FeeRecord, Relation } from "../../../lib/store";

async function saveProfile(formData: FormData) {
  "use server";
  const user = await requireUser();
  const password = String(formData.get("password") || "");
  const data: Record<string, unknown> = {
    name: String(formData.get("name") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    plotNo: String(formData.get("plotNo") || ""),
    address: String(formData.get("address") || ""),
    emergencyPhone: String(formData.get("emergencyPhone") || ""),
    carNumber: String(formData.get("carNumber") || ""),
    contractNo: String(formData.get("contractNo") || ""),
    registeredAt: String(formData.get("registeredAt") || ""),
    annualFee: Number(formData.get("annualFee") || 0),
  };
  const deceasedNames = formData.getAll("deceasedName").map(String);
  const relations = formData.getAll("relation").map(String);
  const plotNos = formData.getAll("relPlotNo").map(String);
  data.relations = deceasedNames
    .map((deceasedName, i) => ({
      deceasedName: deceasedName.trim(),
      relation: (relations[i] || "").trim(),
      plotNo: (plotNos[i] || "").trim(),
    }))
    .filter((row) => row.deceasedName || row.plotNo);
  if (password) data.passwordHash = await hash(password, 12);
  await updateMember(user.id, data);
  revalidatePath("/mypage");
  redirect("/mypage?saved=1");
}

export default async function MyPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const session = await requireUser();
  const { saved } = await searchParams;
  const doc = await findUserById(session.id);
  if (!doc) redirect("/login");

  const relations = ((doc.relations as Relation[] | undefined) || []).slice(0, 8);
  while (relations.length < 4) relations.push({ deceasedName: "", relation: "", plotNo: "" });
  const feeHistory = (doc.feeHistory as FeeRecord[] | undefined) || [];

  return (
    <article className="article">
      <p className="kicker">회원</p>
      <h1>내 정보</h1>
      {saved && <p className="ok">정보가 저장되었습니다.</p>}

      <section className="panel">
        <h2>관리비 현황</h2>
        <p><strong>상태:</strong> {String(doc.feeStatus || "미납")}</p>
        <p><strong>연간 관리비:</strong> {Number(doc.annualFee || 0).toLocaleString()}원</p>
        {feeHistory.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>연도</th><th>금액</th><th>납부</th><th>비고</th></tr></thead>
              <tbody>
                {feeHistory.map((row, i) => (
                  <tr key={i}>
                    <td>{row.year}</td>
                    <td>{row.amount.toLocaleString()}원</td>
                    <td>{row.paid ? "완납" : "미납"}</td>
                    <td>{row.memo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="meta">관리비 내역은 관리자가 등록합니다.</p>
        )}
      </section>

      <form action={saveProfile} className="panel form-grid">
        <h2>회원 정보 수정</h2>
        <label>아이디<input value={String(doc.username)} disabled /></label>
        <label>새 비밀번호 (변경 시만)<input name="password" type="password" autoComplete="new-password" /></label>
        <label>회원 이름<input name="name" defaultValue={String(doc.name || "")} required /></label>
        <label>전화번호<input name="phone" defaultValue={formatPhone(String(doc.phone || ""))} required /></label>
        <label>이메일<input name="email" type="email" defaultValue={String(doc.email || "")} /></label>
        <label>주소<input name="address" defaultValue={String(doc.address || "")} /></label>
        <label>비상 연락처<input name="emergencyPhone" defaultValue={formatPhone(String(doc.emergencyPhone || ""))} /></label>
        <label>차량번호<input name="carNumber" defaultValue={String(doc.carNumber || "")} /></label>
        <label>계약번호<input name="contractNo" defaultValue={String(doc.contractNo || "")} /></label>
        <label>대표 묘역번호<input name="plotNo" defaultValue={String(doc.plotNo || "")} required /></label>
        <label>등록시기<input name="registeredAt" type="date" defaultValue={String(doc.registeredAt || "")} /></label>
        <label>연간 관리비<input name="annualFee" type="number" defaultValue={Number(doc.annualFee || 0)} readOnly /></label>

        <h3>관계 / 망자</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>망자</th><th>관계</th><th>묘역번호</th></tr></thead>
            <tbody>
              {relations.map((row, i) => (
                <tr key={i}>
                  <td><input name="deceasedName" defaultValue={row.deceasedName} /></td>
                  <td><input name="relation" defaultValue={row.relation} /></td>
                  <td><input name="relPlotNo" defaultValue={row.plotNo} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn btn-primary" type="submit">저장</button>
      </form>
    </article>
  );
}
