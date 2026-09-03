import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="article">
      <p className="kicker">계정</p>
      <h1>로그인</h1>
      <p className="lead">관리자 또는 회원 계정으로 로그인해 게시판 글을 작성하세요.</p>
      <form className="panel form-grid" action="/api/login" method="POST">
        <label>
          아이디
          <input name="username" required />
        </label>
        <label>
          비밀번호
          <input name="password" type="password" required />
        </label>
        <button className="btn btn-primary" type="submit">
          로그인
        </button>
      </form>
      <p className="meta">
        기본 관리자 계정은 서버 최초 구동 시 생성됩니다. 로그인 후 <Link href="/">홈으로</Link> 이동해 주세요.
      </p>
    </main>
  );
}
