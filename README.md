# (재)안양공원묘원 홈페이지

경기 안산시 상록구 양상동 **(재)안양공원묘원** 공식 사이트입니다. 안양공원.com·PPT 안내(청약서 절차, PPT·라이브 위수, 관리비·리모델링·서비스)를 휴대폰과 PC에서 같이 보도록 만들었습니다.

커스텀 도메인이 생기기 전 `SITE_URL` 기본값은 Render 주소 `https://mp-anyang.onrender.com` 입니다. 가짜 브랜드 도메인을 넣지 않습니다. 분양가·계좌처럼 출처에 없는 숫자는 **확인 필요**로 두고, 관리자가 원 단위를 넣으면 그 값만 보여 줍니다.

## 로컬에서 보기

Node **20**이 필요합니다. (Render도 20으로 고정합니다. 26은 쓰지 않습니다.)

```bash
npm ci
cp .env.example .env.local
# SUPERVISOR_ID / SUPERVISOR_PASSWORD / ADMIN_SEED / AUTH_SECRET 를 .env.local에 넣습니다.
npm run dev
```

브라우저에서 [http://127.0.0.1:43123](http://127.0.0.1:43123) 을 엽니다. 미리보기용 프로덕션은 `npm run build` 뒤 `npx next start --port 43123 --hostname 127.0.0.1` 입니다. Render는 `npm start`와 대시보드 `PORT`를 씁니다.

홈은 **첫 화면(히어로)만**입니다. 카피는 아래쪽, 전화·오시는 길 알약은 히어로 오른쪽 아래입니다. 소셜 로고 네 개는 푸터 오른쪽입니다. 페이스북·인스타그램·유튜브·네이버 카페 주소가 생기면 `.env`의 빈 칸에만 넣습니다. 주소를 지어내지 마세요. 푸터는 법인명, `경기 안산시 상록구 오리골길 41 (양상동 산50)`, 전화 `031-482-2949 · 15208`만 둡니다.

헤더 오른쪽은 **KR / US / JP / CN** 국기와 **로그인 아이콘**입니다. 감독·관리자로 로그인하면 **관리** 링크가 붙습니다. 메뉴는 왼쪽 **탐색기**입니다. 1차 메뉴 다섯 개(공원소개·분양안내·이용안내·둘러보기·고객센터) 사이만 세로 간격이 넓고, 서브메뉴는 촘촘합니다. 탐색기와 본문은 각각 스크롤됩니다.

로그인(아이디·비밀번호) 뒤에는 **사이트맵**(`/sitemap`)으로 갑니다. 카카오·구글 **간편가입/로그인**은 Render에 넣은 키로 `/api/auth/oauth/kakao`, `/api/auth/oauth/google` 이 콜백을 받습니다.

카카오·구글 콘솔에 등록할 콜백(비밀값 없음):

- `https://mp-anyang.onrender.com/api/auth/callback/kakao`
- `https://mp-anyang.onrender.com/api/auth/callback/google`

`SITE_URL`을 바꾸면 콜백 호스트도 그 주소를 따릅니다. 키는 `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `KAKAO_REST_API_KEY`(또는 `KAKAO_CLIENT_ID`) / `KAKAO_CLIENT_SECRET` 및 Auth.js 별칭(`AUTH_GOOGLE_ID` 등)을 읽습니다. git에 넣지 마세요.

## 환경 변수

| 이름 | 설명 |
| --- | --- |
| `MONGODB_URI` | Atlas 연결 문자열. 없으면 JSON/로컬 파일 폴백 |
| `MONGODB_DB` | 기본값 `MP-Anyang` |
| `SITE_URL` | 커스텀 도메인 전 기본값 `https://mp-anyang.onrender.com` |
| `INQUIRY_INBOX` | 문의 수신 메일(선택). 관리 답변 메모는 메일 발송이 아닙니다 |
| `IMAGE_CDN_BASE` / `NEXT_PUBLIC_IMAGE_CDN_BASE` | 선택. 이미지 CDN |
| `AUTH_SECRET` | 세션 서명. 공개 서비스에서는 꼭 넣으세요 |
| `SUPERVISOR_ID` / `SUPERVISOR_PASSWORD` | 감독 시드. git에 값을 넣지 마세요 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | 구글 간편로그인. Auth.js 별칭 `AUTH_GOOGLE_ID` 등도 읽습니다 |
| `KAKAO_REST_API_KEY` 또는 `KAKAO_CLIENT_ID` / `KAKAO_CLIENT_SECRET` | 카카오 간편로그인. `AUTH_KAKAO_ID` 별칭도 읽습니다 |
| `FACEBOOK` / `INSTAGRAM` / `YOUTUBE` / `CAFE` | 소셜 프로필. 비우면 홈 로고는 전화·오시는 길·분양가·관리비로 갑니다 |
| `NEXT_PUBLIC_FACEBOOK_URL` 등 | 위와 같음. 클라이언트에서 바꿀 때 사용 |

비밀값은 git에 넣지 마세요. 갤러리 업로드는 `public/uploads`이며 Render 재배포 때 파일이 사라질 수 있습니다.

## MongoDB 초기화

**기존 컬렉션을 지우고** `notices`, `inquiries`, `faq`, `members`, `staff`, `cms`, `gallery`를 만듭니다. 복구할 수 없으니 URI가 이 공원 DB가 맞는지 확인하세요. 직원 비번은 bcrypt 해시로만 저장합니다.

```bash
MONGODB_URI="mongodb+srv://..." npm run seed
```

URI가 없어도, `.env.local`에 감독/관리자 시드가 있으면 첫 로그인 때 로컬 직원 파일을 만듭니다.

## Render

기존 웹 서비스에 이 저장소 `main`을 연결합니다.

- **Runtime:** Node 20
- **Build:** `npm ci && npm run build`
- **Start:** `npm start`
- 위 환경 변수를 대시보드에 넣습니다. `PORT`는 Render가 넣습니다.

공개 URL(커스텀 도메인 전): https://mp-anyang.onrender.com  
커스텀 도메인은 호스트명을 받은 뒤에 붙입니다.
