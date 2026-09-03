"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PasswordInput } from "../../components/PasswordInput";

function LoginForm() {
  const searchParams = useSearchParams();
  const [modal, setModal] = useState<"none" | "reset">("none");
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [username, setUsername] = useState(searchParams.get("u") || "");
  const [password, setPassword] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [msg, setMsg] = useState("");

  const signupDone = searchParams.get("signup") === "1";
  const oauthMsg = searchParams.get("oauth");

  const verifyPhone = async () => {
    setMsg("");
    const res = await fetch("/api/password-reset/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "인증에 실패했습니다.");
      return;
    }
    setToken(data.token);
    setUsername(data.username);
    setStep(2);
    setMsg("인증되었습니다. 새 비밀번호를 입력해 주세요.");
  };

  const completeReset = async () => {
    setMsg("");
    if (newPw.length < 6) {
      setMsg("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (newPw !== newPw2) {
      setMsg("비밀번호가 일치하지 않습니다.");
      return;
    }
    const res = await fetch("/api/password-reset/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: newPw }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "재설정에 실패했습니다.");
      return;
    }
    setUsername(data.username);
    setPassword(newPw);
    setModal("none");
    setStep(1);
    setNewPw("");
    setNewPw2("");
    setMsg("비밀번호가 변경되었습니다. 로그인해 주세요.");
  };

  return (
    <>
      {signupDone && <p className="ok">회원가입이 완료되었습니다. 로그인해 주세요.</p>}
      {oauthMsg && <p className="alert">간편 로그인 설정이 필요합니다. Render 환경변수를 확인해 주세요.</p>}
      {msg && <p className={msg.includes("변경") || msg.includes("인증") ? "ok" : "alert"}>{msg}</p>}

      <form className="panel form-grid" action="/api/login" method="POST">
        <label>
          아이디
          <input name="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          비밀번호
          <PasswordInput name="password" value={password} onChange={setPassword} required />
        </label>
        <div className="login-links">
          <button type="button" className="link-btn" onClick={() => { setModal("reset"); setStep(1); setMsg(""); }}>
            비밀번호 찾기
          </button>
          <Link href="/signup">회원 가입</Link>
        </div>
        <button className="btn btn-primary" type="submit">로그인</button>
      </form>

      <div className="oauth-row">
        <a className="btn oauth kakao" href="/api/auth/kakao">카카오로 로그인</a>
        <a className="btn oauth google" href="/api/auth/google">Google로 로그인</a>
      </div>

      {modal === "reset" && (
        <div className="modal-backdrop" onClick={() => setModal("none")}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>비밀번호 찾기</h2>
            {step === 1 ? (
              <div className="form-grid">
                <p className="meta">가입 시 등록한 이름과 전화번호로 본인 확인을 합니다.</p>
                <label>이름<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
                <label>전화번호<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01012345678" required /></label>
                <button type="button" className="btn btn-primary" onClick={verifyPhone}>인증하기</button>
              </div>
            ) : (
              <div className="form-grid">
                <p className="ok">아이디: {username}</p>
                <label>새 비밀번호<input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required /></label>
                <label>비밀번호 확인<input type="password" value={newPw2} onChange={(e) => setNewPw2(e.target.value)} required /></label>
                <button type="button" className="btn btn-primary" onClick={completeReset}>비밀번호 변경</button>
              </div>
            )}
            <button type="button" className="btn btn-sm" onClick={() => setModal("none")}>닫기</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="article login-page">
      <p className="kicker">계정</p>
      <h1>로그인</h1>
      <p className="lead">회원 또는 관리자 계정으로 로그인하세요.</p>
      <Suspense fallback={<p className="meta">로딩 중...</p>}>
        <LoginForm />
      </Suspense>
      <p className="meta">로그인 후 <Link href="/">홈으로</Link> 이동할 수 있습니다.</p>
    </main>
  );
}
