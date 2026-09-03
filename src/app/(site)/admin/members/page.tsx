import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../../lib/auth";
import { formatPhone } from "../../../../lib/phone";
import { deleteMember, listMembers, toId, updateMember } from "../../../../lib/store";
import type { Relation } from "../../../../lib/store";

async function updateMemberAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const password = String(formData.get("password") || "");
  const data: Record<string, unknown> = {
    name: String(formData.get("name") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    plotNo: String(formData.get("plotNo") || ""),
    feeStatus: String(formData.get("feeStatus") || "미납"),
    annualFee: Number(formData.get("annualFee") || 0),
  };
  if (password) data.passwordHash = await hash(password, 12);
  await updateMember(id, data);
  revalidatePath("/admin/members");
  redirect("/admin/members");
}

async function removeMemberAction(formData: FormData) {
  "use server";
  await requireAdmin();
  await deleteMember(String(formData.get("id")));
  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export default async function AdminMembersPage() {
  await requireAdmin();
  const members = await listMembers();

  return (
    <article className="article">
      <p className="kicker">관리자</p>
      <h1>회원 관리</h1>
      <p className="lead">회원 정보 수정 및 삭제</p>

      <div className="list">
        {members.map((m) => {
          const relations = (m.relations as Relation[] | undefined) || [];
          return (
            <div key={toId(m._id)} className="list-item">
              <h3>{String(m.name)} ({String(m.username)})</h3>
              <div className="meta">
                {formatPhone(String(m.phone || ""))} · {String(m.email || "-")} · 묘역 {String(m.plotNo || "-")}
              </div>
              <p>관리비: {Number(m.annualFee || 0).toLocaleString()}원 / {String(m.feeStatus || "미납")}</p>
              {relations.length > 0 && (
                <p className="meta">관계: {relations.map((r) => `${r.deceasedName}(${r.relation})`).join(", ")}</p>
              )}

              <form action={updateMemberAction} className="panel form-grid admin-form">
                <input type="hidden" name="id" value={toId(m._id)} />
                <label>이름<input name="name" defaultValue={String(m.name || "")} /></label>
                <label>전화<input name="phone" defaultValue={String(m.phone || "")} /></label>
                <label>이메일<input name="email" defaultValue={String(m.email || "")} /></label>
                <label>묘역<input name="plotNo" defaultValue={String(m.plotNo || "")} /></label>
                <label>관리비<input name="annualFee" type="number" defaultValue={Number(m.annualFee || 0)} /></label>
                <label>납부상태
                  <select name="feeStatus" defaultValue={String(m.feeStatus || "미납")}>
                    <option>완납</option>
                    <option>미납</option>
                    <option>분납</option>
                  </select>
                </label>
                <label>새 비밀번호<input name="password" type="password" placeholder="변경 시만 입력" /></label>
                <button className="btn btn-primary btn-sm" type="submit">수정</button>
              </form>

              <form action={removeMemberAction} className="admin-actions">
                <input type="hidden" name="id" value={toId(m._id)} />
                <button className="btn btn-danger btn-sm" type="submit">삭제</button>
              </form>
            </div>
          );
        })}
        {members.length === 0 && <p className="alert">등록된 회원이 없습니다.</p>}
      </div>
    </article>
  );
}
