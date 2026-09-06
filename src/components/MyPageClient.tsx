"use client";

import { MemberChargesView } from "./MemberChargesView";
import { MemberProfileFields } from "./MemberProfileFields";
import { PasswordInput } from "./PasswordInput";
import { formatSmsConsentAt } from "../lib/sms-consent";
import type { MemberProfileInitial } from "../lib/member-profile";
import type { MemberChargeRow } from "../lib/member-charges-types";

type Props = {
  username: string;
  initial: MemberProfileInitial;
  charges: MemberChargeRow[];
  smsConsentAt: string | null;
  setupRequired: boolean;
  saved: boolean;
  error?: string | null;
  saveProfile: (formData: FormData) => Promise<void>;
};

export function MyPageClient({
  username,
  initial,
  charges,
  smsConsentAt,
  setupRequired,
  saved,
  error,
  saveProfile,
}: Props) {
  return (
    <article className="article signup-page mypage-page">
      <p className="kicker">회원</p>
      <h1>{setupRequired ? "회원 정보 등록" : "내 정보"}</h1>

      {error && <p className="alert">{error}</p>}
      {setupRequired && (
        <p className="alert">
          회원 정보 등록이 필요합니다. 이름·전화번호·대표 묘역번호를 포함해 아래 내용을 입력한 뒤 저장해 주세요.
        </p>
      )}
      {saved && !setupRequired && <p className="ok">정보가 저장되었습니다.</p>}
      {saved && setupRequired && <p className="ok">회원 정보가 등록되었습니다.</p>}

      {!setupRequired && (
        <section className="panel member-cost-panel">
          <h2 className="signup-section-title">비용 현황</h2>
          <MemberChargesView charges={charges} />
          {charges.length === 0 && (
            <p className="meta">등록된 비용 내역이 없습니다. 관리자가 원장에 등록하면 여기에 표시됩니다.</p>
          )}
        </section>
      )}

      <form action={saveProfile} className="panel form-grid signup-form-compact">
        <h2 className="signup-section-title">계정</h2>
        <div className="signup-grid-basic">
          <label>
            아이디
            <input value={username} disabled />
          </label>
          <label>
            새 비밀번호 (변경 시만)
            <PasswordInput name="password" autoComplete="new-password" />
          </label>
        </div>

        <MemberProfileFields initial={initial} feesReadOnly />

        {smsConsentAt ? <p className="meta">SMS 동의 일시: {formatSmsConsentAt(smsConsentAt)}</p> : null}

        <button className="btn btn-primary signup-submit" type="submit">
          {setupRequired ? "회원 정보 등록" : "저장"}
        </button>
      </form>
    </article>
  );
}
