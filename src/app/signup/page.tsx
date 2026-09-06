"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CompactFooter } from "../../components/CompactFooter";
import { IdentityVerificationGate } from "../../components/IdentityVerificationGate";
import { MemberProfileFields } from "../../components/MemberProfileFields";
import { PasswordInput } from "../../components/PasswordInput";
import { emptyMemberProfile } from "../../lib/member-profile";
import { GOOGLE_REDIRECT_URI_HINT, KAKAO_REDIRECT_URI_HINT, oauthErrorMessage } from "../../lib/oauth-errors";

const ERROR_MSG: Record<string, string> = {
  required: "필수 항목을 입력해 주세요.",
  pw: "비밀번호가 일치하지 않습니다.",
  short: "비밀번호는 6자 이상이어야 합니다.",
  id: "이미 사용 중인 아이디입니다.",
  phone: "이미 등록된 전화번호입니다.",
  identity: "본인인증을 먼저 완료해 주세요.",
  underage: "만 15세 이상만 가입할 수 있습니다.",
  duplicate: "이미 가입된 본인인증 정보입니다.",
};

function SignupForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const oauthMsg = searchParams.get("oauth");
  const [identityVerified, setIdentityVerified] = useState<boolean | null>(null);
  const [profileInitial, setProfileInitial] = useState(emptyMemberProfile());

  useEffect(() => {
    void fetch("/api/identity/status")
      .then((r) => r.json())
      .then((data: { enabled: boolean; verified: boolean; name: string; phone: string }) => {
        if (data.enabled && data.verified) {
          setProfileInitial((prev) => ({ ...prev, name: data.name, phone: data.phone }));
        }
      })
      .catch(() => undefined);
  }, [searchParams.get("verified")]);

  return (
    <>
      <IdentityVerificationGate returnTo="/signup" onVerifiedChange={setIdentityVerified} />

      <form
        className="panel form-grid signup-form-compact"
        action="/api/signup"
        method="POST"
        onSubmit={(e) => {
          if (identityVerified === false) {
            e.preventDefault();
            alert("본인인증을 먼저 완료해 주세요.");
          }
        }}
      >
      {error && <p className="alert signup-alert">{ERROR_MSG[error] || "회원가입 중 오류가 발생했습니다."}</p>}
      {oauthMsg && (
        <>
          <p className="alert">{oauthErrorMessage(oauthMsg)}</p>
          {oauthMsg.startsWith("kakao") && (
            <p className="meta signup-oauth-meta">
              Redirect URI: <code>{KAKAO_REDIRECT_URI_HINT}</code>
            </p>
          )}
          {oauthMsg.startsWith("google") && (
            <p className="meta signup-oauth-meta">
              Redirect URI: <code>{GOOGLE_REDIRECT_URI_HINT}</code>
            </p>
          )}
        </>
      )}

      <div className="signup-oauth-bar">
        <a className="btn oauth kakao btn-sm" href="/api/auth/kakao">
          카카오 간편 가입
        </a>
        <a className="btn oauth google btn-sm" href="/api/auth/google">
          Google 간편 가입
        </a>
        <span className="meta signup-oauth-note">간편 가입 후에도 아래 회원 정보는 필수입니다.</span>
      </div>

      <h2 className="signup-section-title">계정</h2>
      <div className="signup-grid-basic signup-grid-account">
        <label>
          아이디
          <input name="username" required placeholder="로그인 ID" />
        </label>
        <label>
          비밀번호
          <PasswordInput name="password" autoComplete="new-password" required />
        </label>
        <label>
          비밀번호 확인
          <PasswordInput name="password2" autoComplete="new-password" required />
        </label>
      </div>

      <MemberProfileFields
        initial={profileInitial}
        identityLocked={identityVerified === true}
      />

      <button className="btn btn-primary signup-submit" type="submit">
        회원 가입
      </button>
    </form>
    </>
  );
}

export default function SignupPage() {
  return (
    <div className="auth-screen auth-screen-compact">
      <main className="article signup-page">
        <p className="kicker">계정</p>
        <h1>회원 가입</h1>
        <Suspense fallback={<p className="meta">로딩 중…</p>}>
          <SignupForm />
        </Suspense>
      </main>
      <CompactFooter light />
    </div>
  );
}
