"use client";

import Link from "next/link";
import { useState } from "react";
import { PasswordInput } from "./PasswordInput";

type Props = {
  next: string;
  onClose: () => void;
};

export function LoginModal({ next, onClose }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal login-modal" onClick={(e) => e.stopPropagation()}>
        <h2>로그인</h2>
        <p className="meta">내 추모관을 보려면 로그인해 주세요.</p>
        {msg && <p className="alert">{msg}</p>}

        <form
          className="form-grid"
          action="/api/login"
          method="POST"
          onSubmit={(e) => {
            if (!username.trim() || !password) {
              e.preventDefault();
              setMsg("아이디와 비밀번호를 입력해 주세요.");
            }
          }}
        >
          <input type="hidden" name="next" value={next} />
          <label>
            아이디
            <input name="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label>
            비밀번호
            <PasswordInput name="password" value={password} onChange={setPassword} required />
          </label>
          <div className="login-links">
            <Link href={`/login?next=${encodeURIComponent(next)}`}>비밀번호 찾기</Link>
            <Link href="/signup">회원 가입</Link>
          </div>
          <button className="btn btn-primary" type="submit">
            로그인
          </button>
        </form>

        <div className="oauth-row">
          <a className="btn oauth kakao" href="/api/auth/kakao">
            카카오로 로그인
          </a>
          <a className="btn oauth google" href="/api/auth/google">
            Google로 로그인
          </a>
        </div>

        <button type="button" className="btn btn-sm" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
