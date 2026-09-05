"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";
import { CompactFooter } from "../../components/CompactFooter";
import { PasswordInput } from "../../components/PasswordInput";

const ERROR_MSG: Record<string, string> = {
  required: "필수 항목을 입력해 주세요.",
  pw: "비밀번호가 일치하지 않습니다.",
  short: "비밀번호는 6자 이상이어야 합니다.",
  id: "이미 사용 중인 아이디입니다.",
  phone: "이미 등록된 전화번호입니다.",
};

function resizeRows(values: string[], count: number) {
  const next = [...values];
  while (next.length < count) next.push("");
  return next.slice(0, count);
}

function SignupForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [plotNo, setPlotNo] = useState("");
  const [annualFee, setAnnualFee] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [feeAuto, setFeeAuto] = useState(false);
  const [rowCount, setRowCount] = useState(2);
  const [plotHint, setPlotHint] = useState("");
  const [plotStatus, setPlotStatus] = useState<"idle" | "loading" | "ok" | "miss">("idle");
  const [deceasedNames, setDeceasedNames] = useState<string[]>(["", ""]);
  const [relations, setRelations] = useState<string[]>(["", ""]);
  const [relPlotNos, setRelPlotNos] = useState<string[]>(["", ""]);

  const applyPlotLookup = useCallback(async (value: string) => {
    const key = value.trim();
    if (!key) {
      setPlotHint("");
      setPlotStatus("idle");
      setFeeAuto(false);
      return;
    }

    setPlotStatus("loading");
    try {
      const res = await fetch(`/api/plot-lookup?plotNo=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (!data.found) {
        setPlotStatus("miss");
        setPlotHint("등록된 묘역번호가 없습니다. 상담 후 정확한 번호를 입력해 주세요.");
        setRowCount(4);
        setDeceasedNames((prev) => resizeRows(prev, 4));
        setRelations((prev) => resizeRows(prev, 4));
        setRelPlotNos((prev) => resizeRows(prev, 4).map((_, i) => (i === 0 ? key : prev[i] || "")));
        return;
      }

      const slots = Number(data.slots) || 2;
      setPlotStatus("ok");
      setPlotHint(`${data.type}${data.capacity ? ` · ${data.capacity}` : ""} — 망자 ${slots}명 (${data.hint || ""})`);
      if (data.annualFee) {
        setAnnualFee(Number(data.annualFee));
        setSalePrice(Number(data.salePrice) || 0);
        setFeeAuto(true);
      }
      setRowCount(slots);
      setDeceasedNames((prev) => resizeRows(prev, slots));
      setRelations((prev) => resizeRows(prev, slots));
      setRelPlotNos(Array(slots).fill(key));
    } catch {
      setPlotStatus("miss");
      setPlotHint("묘역 정보를 불러오지 못했습니다.");
    }
  }, []);

  return (
    <>
      {error && <p className="alert signup-alert">{ERROR_MSG[error] || "회원가입 중 오류가 발생했습니다."}</p>}
      <form className="panel form-grid signup-form-compact" action="/api/signup" method="POST">
        <h2 className="signup-section-title">기본 정보</h2>
        <div className="signup-grid-basic">
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
          <label>
            회원 이름
            <input name="name" required />
          </label>
          <label>
            전화번호
            <input name="phone" required placeholder="01012345678" />
          </label>
          <label>
            이메일
            <input name="email" type="email" />
          </label>
          <label>
            주소
            <input name="address" placeholder="우편물 수신" />
          </label>
          <label>
            비상 연락처
            <input name="emergencyPhone" placeholder="010..." />
          </label>
          <label>
            차량번호
            <input name="carNumber" />
          </label>
          <label>
            계약번호
            <input name="contractNo" />
          </label>
          <label className="signup-plot-field">
            대표 묘역번호
            <input
              name="plotNo"
              required
              placeholder="예: A-101"
              value={plotNo}
              onChange={(e) => setPlotNo(e.target.value)}
              onBlur={() => applyPlotLookup(plotNo)}
            />
          </label>
          <label>
            등록시기
            <input name="registeredAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </label>
          <label>
            분양가(원)
            <input
              name="salePrice"
              type="number"
              min="0"
              value={salePrice}
              readOnly={feeAuto}
              onChange={(e) => setSalePrice(Number(e.target.value))}
            />
          </label>
          <label>
            연간 관리비(원)
            <input
              name="annualFee"
              type="number"
              min="0"
              value={annualFee}
              readOnly={feeAuto}
              onChange={(e) => setAnnualFee(Number(e.target.value))}
            />
          </label>
          {feeAuto && (annualFee > 0 || salePrice > 0) ? (
            <p className="meta signup-fee-hint ok">
              요금표 기준 — 분양 {salePrice.toLocaleString()}원 · 연관리 {annualFee.toLocaleString()}원 (임시)
            </p>
          ) : null}
        </div>

        <h2 className="signup-section-title">관계 / 망자</h2>
        {plotHint ? (
          <p className={`meta signup-plot-hint ${plotStatus === "ok" ? "ok" : plotStatus === "miss" ? "alert-inline" : ""}`}>
            {plotStatus === "loading" ? "묘역 정보 확인 중…" : plotHint}
          </p>
        ) : (
          <p className="meta signup-plot-hint">대표 묘역번호 입력 후 형태·기수에 맞게 행이 조정됩니다.</p>
        )}

        <div className="signup-relations table-wrap">
          <table className="data-table signup-relation-table">
            <thead>
              <tr>
                <th>망자</th>
                <th>관계</th>
                <th>묘역번호</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <input
                      name="deceasedName"
                      placeholder="성함"
                      value={deceasedNames[i] || ""}
                      onChange={(e) =>
                        setDeceasedNames((prev) => {
                          const next = [...prev];
                          next[i] = e.target.value;
                          return next;
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      name="relation"
                      placeholder="부·모·배우자"
                      value={relations[i] || ""}
                      onChange={(e) =>
                        setRelations((prev) => {
                          const next = [...prev];
                          next[i] = e.target.value;
                          return next;
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      name="relPlotNo"
                      placeholder="A-101"
                      value={relPlotNos[i] || ""}
                      onChange={(e) =>
                        setRelPlotNos((prev) => {
                          const next = [...prev];
                          next[i] = e.target.value;
                          return next;
                        })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="signup-section-title">SMS 수신</h2>
        <div className="consent-box consent-box-compact">
          <label className="consent-label">
            <input name="smsConsent" type="checkbox" />
            <span>[선택] SMS 서비스 알림 (관리비·기일·공지)</span>
          </label>
          <label className="consent-label">
            <input name="marketingSmsConsent" type="checkbox" />
            <span>[선택] 마케팅·홍보 SMS</span>
          </label>
        </div>

        <button className="btn btn-primary signup-submit" type="submit">
          회원 가입
        </button>
      </form>
    </>
  );
}

export default function SignupPage() {
  return (
    <div className="auth-screen">
      <main className="article signup-page">
        <p className="kicker">계정</p>
        <h1>회원 가입</h1>
        <p className="lead">묘역찾기·관리비 조회를 위한 회원 등록입니다.</p>
        <Suspense fallback={<p className="meta">로딩 중…</p>}>
          <SignupForm />
        </Suspense>
        <p className="meta signup-login-link">
          이미 계정이 있으신가요? <Link href="/login">로그인</Link>
        </p>
      </main>
      <CompactFooter light />
    </div>
  );
}
