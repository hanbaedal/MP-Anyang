# (재)안양공원묘원 홈페이지

경기 안산시 상록구 양상동 **(재)안양공원묘원** 1차 공식 사이트입니다. 안양공원.com의 안내(청약서 절차, 라이브 위수, 관리비·리모델링·서비스)를 휴대폰과 PC에서 같이 보도록 다시 만들었습니다.

분양가·관리비 금액, 계좌번호, 회원·결제·묻고답하기는 넣지 않았습니다. 커스텀 도메인이 생기기 전 `SITE_URL` 기본값은 Render 주소 `https://mp-anyang.onrender.com` 입니다. 가짜 브랜드 도메인을 넣지 않습니다.

## 로컬에서 보기

Node 20 이상이 필요합니다.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

브라우저에서 [http://127.0.0.1:43123](http://127.0.0.1:43123) 을 엽니다.

## 환경 변수

| 이름 | 설명 |
| --- | --- |
| `MONGODB_URI` | Atlas 연결 문자열. 없으면 공지는 `data/notices.json`, 문의는 `data/inquiries.local.json` |
| `MONGODB_DB` | 기본값 `MP-Anyang` |
| `SITE_URL` | 커스텀 도메인 전 기본값 `https://mp-anyang.onrender.com`. 새 호스트명이 생기면 그걸로 바꿉니다 |
| `INQUIRY_INBOX` | 문의 수신 메일. 없어도 문의는 DB/파일에 저장됩니다 |

비밀값은 git에 넣지 마세요.

## MongoDB 초기화

**기존 컬렉션을 지우고** `notices`, `inquiries`만 만듭니다. 복구할 수 없으니 URI가 이 공원 DB가 맞는지 확인하세요.

```bash
MONGODB_URI="mongodb+srv://..." npm run seed
```

## Render

기존 웹 서비스에 이 저장소 `main`을 연결합니다.

- **Runtime:** Node 20
- **Build:** `npm ci && npm run build`
- **Start:** `npm start`
- 위 환경 변수를 대시보드에 넣습니다. `PORT`는 Render가 넣습니다.

공개 URL(커스텀 도메인 전): https://mp-anyang.onrender.com  
커스텀 도메인은 호스트명을 받은 뒤에 붙입니다. GitHub `main`이 옛 코드이면 이 주소도 옛 앱을 보여 줍니다.
