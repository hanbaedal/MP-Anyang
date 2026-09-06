"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Status = {
  enabled: boolean;
  mode: string;
  configured: boolean;
  minAge: number;
  verified: boolean;
  name: string;
  phone: string;
};

type Props = {
  returnTo?: string;
  onVerifiedChange?: (verified: boolean) => void;
};

const MODE_LABEL: Record<string, string> = {
  mock: "개발용(mock)",
  nice: "NICE",
  danal: "Danal",
};

export function IdentityVerificationGate({ returnTo = "/signup", onVerifiedChange }: Props) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/identity/status")
      .then((r) => r.json())
      .then((data: Status) => {
        if (!cancelled) {
          setStatus(data);
          onVerifiedChange?.(data.enabled ? Boolean(data.verified) : true);
        }
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, [onVerifiedChange]);

  if (!status?.enabled) return null;

  const verifyHref = `/identity/verify?next=${encodeURIComponent(returnTo)}`;
  const modeLabel = MODE_LABEL[status.mode] || status.mode;

  if (status.verified) {
    return (
      <div className="panel identity-gate identity-gate-ok">
        <p className="identity-gate-title">본인인증 완료</p>
        <p className="meta">
          {status.name} · {status.phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")} · 만 {status.minAge}세 이상 확인됨
        </p>
        <p className="meta identity-gate-mode">인증 수단: {modeLabel}</p>
      </div>
    );
  }

  return (
    <div className="panel identity-gate identity-gate-required">
      <p className="identity-gate-title">본인인증 필요</p>
      <p className="meta">회원 가입을 위해 만 {status.minAge}세 이상 본인인증이 필요합니다.</p>
      {!status.configured && status.mode !== "mock" ? (
        <p className="alert">NICE/Danal 연동 키가 설정되지 않았습니다. 관리자에게 문의해 주세요.</p>
      ) : null}
      <Link className="btn btn-primary" href={verifyHref}>
        본인인증 하기
      </Link>
    </div>
  );
}
