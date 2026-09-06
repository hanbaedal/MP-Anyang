"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CompactFooter } from "../../../components/CompactFooter";

const ERROR_MSG: Record<string, string> = {
  underage: "만 15세 이상만 가입할 수 있습니다.",
  duplicate: "이미 가입된 본인인증 정보입니다.",
  invalid: "입력 정보를 확인해 주세요.",
  provider: "현재 인증 수단을 사용할 수 없습니다.",
  provider_pending: "NICE/Danal 연동 준비 중입니다. 관리자에게 문의해 주세요.",
  disabled: "본인인증이 비활성화되어 있습니다.",
};

type Status = {
  enabled: boolean;
  mode: string;
  configured: boolean;
  minAge: number;
};

function VerifyContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const next = searchParams.get("next") || "/signup";
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    void fetch("/api/identity/status")
      .then((r) => r.json())
      .then((data: Status) => setStatus(data))
      .catch(() => setStatus(null));
  }, []);

  if (!status) return <p className="meta">로딩 중…</p>;
  if (!status.enabled) {
    return (
      <div className="panel">
        <p className="meta">본인인증이 비활성화되어 있습니다.</p>
        <Link className="btn btn-primary" href={next}>
          돌아가기
        </Link>
      </div>
    );
  }

  const startHref = `/api/identity/start?next=${encodeURIComponent(next)}`;

  return (
    <div className="panel form-grid signup-form-compact identity-verify-form">
      {error ? <p className="alert signup-alert">{ERROR_MSG[error] || "본인인증 중 오류가 발생했습니다."}</p> : null}
      <p className="meta">만 {status.minAge}세 이상만 가입할 수 있습니다.</p>

      {status.mode === "mock" ? (
        <>
          <p className="meta identity-verify-lead">
            <strong>개발·테스트용(mock)</strong> — NICE/Danal 계약 후 환경 변수만 변경하면 실제 인증으로 전환됩니다.
          </p>
          <form action="/api/identity/mock" method="POST" className="form-grid">
            <input type="hidden" name="returnTo" value={next} />
            <label>
              이름 (실명)
              <input name="name" required autoComplete="name" placeholder="홍길동" />
            </label>
            <label>
              생년월일
              <input name="birthDate" type="date" required />
            </label>
            <label>
              휴대폰 번호
              <input name="phone" required autoComplete="tel" placeholder="01012345678" />
            </label>
            <button className="btn btn-primary signup-submit" type="submit">
              본인인증 완료 (mock)
            </button>
          </form>
        </>
      ) : status.configured ? (
        <>
          <p className="meta">아래 버튼으로 {status.mode === "nice" ? "NICE" : "Danal"} 본인인증을 진행합니다.</p>
          <a className="btn btn-primary" href={startHref}>
            {status.mode === "nice" ? "NICE" : "Danal"} 본인인증 시작
          </a>
        </>
      ) : (
        <p className="alert">NICE/Danal API 키가 설정되지 않았습니다. Render 환경 변수를 확인해 주세요.</p>
      )}

      <Link className="btn btn-ghost" href={next}>
        돌아가기
      </Link>
    </div>
  );
}

export default function IdentityVerifyPage() {
  return (
    <div className="auth-screen auth-screen-compact">
      <main className="article signup-page">
        <p className="kicker">본인인증</p>
        <h1>만 15세 이상 확인</h1>
        <Suspense fallback={<p className="meta">로딩 중…</p>}>
          <VerifyContent />
        </Suspense>
      </main>
      <CompactFooter light />
    </div>
  );
}
