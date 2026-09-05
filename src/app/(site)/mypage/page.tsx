import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { guardMemberPage } from "../../../lib/auth";
import { listMemberSubscriptions, subscriptionLabel } from "../../../lib/memorial-billing";
import { formatPhone } from "../../../lib/phone";
import { formatSmsConsentAt, smsConsentFromForm } from "../../../lib/sms-consent";
import { deleteMember, findUserById, toId, updateMember } from "../../../lib/store";
import type { FeeRecord, Relation } from "../../../lib/store";

async function saveProfile(formData: FormData) {
  "use server";
  const user = await guardMemberPage();
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
  Object.assign(data, smsConsentFromForm(formData));
  await updateMember(user.id, data);
  revalidatePath("/mypage");
  redirect("/mypage?saved=1");
}

export default async function MyPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const session = await guardMemberPage();
  const { saved } = await searchParams;
  const doc = await findUserById(session.id);
  if (!doc) redirect("/login");

  const relations = ((doc.relations as Relation[] | undefined) || []).slice(0, 8);
  while (relations.length < 4) relations.push({ deceasedName: "", relation: "", plotNo: "" });
  const feeHistory = (doc.feeHistory as FeeRecord[] | undefined) || [];
  const memorialSubs = await listMemberSubscriptions(session.id);

  return (
    <article className="article">
      <p className="kicker">회원</p>
      <h1>내 정보</h1>
      {saved && <p className="ok">정보가 저장되었습니다.</p>}

      <section className="panel member-cost-panel">
        <h2>비용 현황</h2>
        <div className="member-cost-grid">
          <div className="member-cost-item">
            <h3>분양가</h3>
            <p className="member-cost-amount">
              {Number(doc.salePrice || 0) > 0 ? `${Number(doc.salePrice).toLocaleString()}원` : "—"}
            </p>
            <p className="meta">계약 시 1회 분양 금액 (관리자 등록)</p>
          </div>
          <div className="member-cost-item">
            <h3>연간 관리비</h3>
            <p className="member-cost-amount">{Number(doc.annualFee || 0).toLocaleString()}원</p>
            <p className="meta">
              납부 상태: <strong>{String(doc.feeStatus || "미납")}</strong>
            </p>
          </div>
          <div className="member-cost-item">
            <h3>사이버 추모관</h3>
            {memorialSubs.length ? (
              <ul className="member-cost-list">
                {memorialSubs.map((sub) => (
                  <li key={String(sub._id)}>
                    {sub.hallCode} · {subscriptionLabel(sub.planId)} · ~
                    {new Date(sub.expiresAt).toLocaleDateString("ko-KR")}까지
                  </li>
                ))}
              </ul>
            ) : (
              <p className="meta">이용 중인 유료 추모관 없음 · <a href="/memorial/plans">요금 안내</a></p>
            )}
          </div>
          <div className="member-cost-item">
            <h3>기타</h3>
            <p className="meta">상조·리모델링·추모 대행 등은 상담·계약 후 별도 안내</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>관리비 납부 내역</h2>
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

        <h3>SMS 수신 동의</h3>
        <div className="consent-box">
          <label className="consent-label">
            <input name="smsConsent" type="checkbox" defaultChecked={Boolean(doc.smsConsent)} />
            <span>[선택] SMS 서비스 알림 수신 (관리비·기일·운영 안내)</span>
          </label>
          <label className="consent-label">
            <input name="marketingSmsConsent" type="checkbox" defaultChecked={Boolean(doc.marketingSmsConsent)} />
            <span>[선택] 마케팅·홍보 SMS 수신</span>
          </label>
          <p className="meta">동의 일시: {formatSmsConsentAt(doc.smsConsentAt)}</p>
        </div>
        <button className="btn btn-primary" type="submit">저장</button>
      </form>
    </article>
  );
}
