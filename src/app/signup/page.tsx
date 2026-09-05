"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PasswordInput } from "../../components/PasswordInput";

const ERROR_MSG: Record<string, string> = {
  required: "필수 항목을 입력해 주세요.",
  pw: "비밀번호가 일치하지 않습니다.",
  short: "비밀번호는 6자 이상이어야 합니다.",
  id: "이미 사용 중인 아이디입니다.",
  phone: "이미 등록된 전화번호입니다.",
};

function SignupForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [rows, setRows] = useState(4);

  return (
    <>
      {error && <p className="alert">{ERROR_MSG[error] || "회원가입 중 오류가 발생했습니다."}</p>}
      <form className="panel form-grid" action="/api/signup" method="POST">
        <h2>기본 정보</h2>
        <label>아이디<input name="username" required placeholder="로그인 아이디" /></label>
        <label>비밀번호<PasswordInput name="password" autoComplete="new-password" required /></label>
        <label>비밀번호 확인<PasswordInput name="password2" autoComplete="new-password" required /></label>
        <label>회원 이름<input name="name" required /></label>
        <label>전화번호<input name="phone" required placeholder="01012345678" /></label>
        <label>이메일<input name="email" type="email" /></label>
        <label>주소<input name="address" placeholder="우편물·안내 수신 주소" /></label>
        <label>비상 연락처<input name="emergencyPhone" placeholder="01012345678" /></label>
        <label>차량번호<input name="carNumber" placeholder="성묘철 주차 안내용" /></label>
        <label>계약번호<input name="contractNo" placeholder="분양 계약번호" /></label>
        <label>대표 묘역번호<input name="plotNo" required placeholder="예: A-101" /></label>
        <label>등록시기<input name="registeredAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label>
        <label>연간 관리비(원)<input name="annualFee" type="number" min="0" defaultValue="0" /></label>

        <h2>관계 / 망자 (최대 8명)</h2>
        <p className="meta">기본 4행, 필요 시 행을 추가하세요. 망자·관계·묘역번호를 함께 등록합니다.</p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>망자 성함</th>
                <th>관계</th>
                <th>묘역번호</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, i) => (
                <tr key={i}>
                  <td><input name="deceasedName" placeholder="예: 홍길동" /></td>
                  <td><input name="relation" placeholder="예: 부, 모, 배우자" /></td>
                  <td><input name="relPlotNo" placeholder="예: A-101" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows < 8 && (
          <button type="button" className="btn btn-sm" onClick={() => setRows((v) => Math.min(8, v + 1))}>
            관계 행 추가
          </button>
        )}

        <h2>SMS 수신 동의</h2>
        <div className="consent-box">
          <label className="consent-label">
            <input name="smsConsent" type="checkbox" />
            <span>[선택] SMS 서비스 알림 수신에 동의합니다. (관리비 안내, 기일·명절 안내, 운영 공지)</span>
          </label>
          <label className="consent-label">
            <input name="marketingSmsConsent" type="checkbox" />
            <span>[선택] 마케팅·홍보 SMS 수신에 동의합니다.</span>
          </label>
          <p className="meta">동의하지 않아도 회원가입은 가능합니다. 동의 시에만 문자 알림을 보내드립니다.</p>
        </div>

        <button className="btn btn-primary" type="submit">회원 가입</button>
      </form>
    </>
  );
}

export default function SignupPage() {
  return (
    <main className="article">
      <p className="kicker">계정</p>
      <h1>회원 가입</h1>
      <p className="lead">안양공원묘지 장례식장 회원 등록입니다. 가입 후 묘역찾기·관리비 조회를 이용할 수 있습니다.</p>
      <Suspense fallback={<p className="meta">로딩 중...</p>}>
        <SignupForm />
      </Suspense>
      <p className="meta">이미 계정이 있으신가요? <Link href="/login">로그인</Link></p>
    </main>
  );
}
