# (재)안양공원묘원 홈페이지

경기 안산시 상록구 양상동 **(재)안양공원묘원** 공식 사이트입니다. 안양공원.com·PPT 안내(청약서 절차, PPT·라이브 위수, 관리비·리모델링·서비스, 분양가 10% 계약금)를 휴대폰과 PC에서 같이 보도록 만들었습니다.

커스텀 도메인이 생기기 전 `SITE_URL` 기본값은 Render 주소 `https://mp-anyang.onrender.com` 입니다. 가짜 브랜드 도메인을 넣지 않습니다. 분양가·계좌·카카오채널 URL처럼 출처에 없는 숫자는 **확인 필요**로 두고, 지어내지 않습니다.

## 로컬에서 보기

Node **20**이 필요합니다. (Render도 20으로 고정합니다. 26은 쓰지 않습니다.)

```bash
npm ci
cp .env.example .env.local
npm run dev
```

브라우저에서 [http://127.0.0.1:43123](http://127.0.0.1:43123) 을 엽니다.

헤더 오른쪽(예전 전화번호 자리)의 **KR / US / JP / CN** 국기를 누르면 한국어·영어·일본어·중국어(간체, `zh-CN`)로 바뀝니다. 선택은 `locale` 쿠키(1년)에 남고, 주소는 바꾸지 않습니다. 전화 `031-482-2949`는 히어로·오시는 길·문의·푸터에 그대로 있습니다.

## 환경 변수

| 이름 | 설명 |
| --- | --- |
| `MONGODB_URI` | Atlas 연결 문자열. 없으면 공지·묻고답하기는 JSON, 문의·벌초·회원은 로컬 파일 |
| `MONGODB_DB` | 기본값 `MP-Anyang` |
| `SITE_URL` | 커스텀 도메인 전 기본값 `https://mp-anyang.onrender.com` |
| `INQUIRY_INBOX` | 문의 수신 메일. 없어도 문의는 DB/파일에 저장됩니다 |
| `IMAGE_CDN_BASE` / `NEXT_PUBLIC_IMAGE_CDN_BASE` | 선택. 이미지 CDN 오리진. 비우면 `/images` 와 `/images/thumbs` |
| `AUTH_SECRET` | 회원 세션 서명. 공개 서비스에서는 꼭 넣으세요 |

비밀값은 git에 넣지 마세요. 운영자 사진 업로드 API는 없습니다.

## MongoDB 초기화

**기존 컬렉션을 지우고** `notices`, `inquiries`, `faq`, `weeding`, `members`를 만듭니다. 복구할 수 없으니 URI가 이 공원 DB가 맞는지 확인하세요.

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
커스텀 도메인은 호스트명을 받은 뒤에 붙입니다.
