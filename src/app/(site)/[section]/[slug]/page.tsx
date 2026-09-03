import Image from "next/image";
import { notFound } from "next/navigation";
import { getPage, slugsOf } from "../../../../lib/content";
import { createBoardPost, createInquiry, getBoard, getFaqs, getGallery, getInquiry, getNotices, toId } from "../../../../lib/store";
import { readSession } from "../../../../lib/auth";

type Params = { section: string; slug: string };

export const dynamic = "force-dynamic";
export const dynamicParams = true;

async function submitBoard(formData: FormData) {
  "use server";
  const user = await readSession();
  if (!user) return;
  await createBoardPost({
    title: String(formData.get("title") || ""),
    content: String(formData.get("content") || ""),
    author: user.name,
    userId: user.id,
  });
}

async function submitInquiry(formData: FormData) {
  "use server";
  const user = await readSession();
  await createInquiry({
    name: String(formData.get("name") || ""),
    phone: String(formData.get("phone") || ""),
    category: String(formData.get("category") || ""),
    message: String(formData.get("message") || ""),
    userId: user?.id,
  });
}

export default async function SectionPage({ params }: { params: Promise<Params> }) {
  const { section, slug } = await params;

  if (section === "support" && slug === "notices") {
    const notices = await getNotices();
    return (
      <article className="article">
        <p className="kicker">고객센터</p>
        <h1>공지사항</h1>
        <div className="list">
          {notices.map((item) => (
            <div key={toId(item._id)} className="list-item">
              <h3>{String(item.title)}</h3>
              <div className="meta">{new Date(String(item.createdAt)).toLocaleDateString("ko-KR")} · {String(item.author)}</div>
              <p>{String(item.content)}</p>
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (section === "support" && slug === "faq") {
    const faqs = await getFaqs();
    return (
      <article className="article">
        <p className="kicker">고객센터</p>
        <h1>자주묻는 질문</h1>
        <div className="list">
          {faqs.map((item) => (
            <div key={toId(item._id)} className="list-item">
              <h3>Q. {String(item.question)}</h3>
              <p>A. {String(item.answer)}</p>
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (section === "support" && slug === "gallery") {
    const gallery = await getGallery();
    return (
      <article className="article">
        <p className="kicker">고객센터</p>
        <h1>갤러리</h1>
        <div className="gallery-grid">
          {gallery.map((item) => (
            <figure key={toId(item._id)}>
              <Image src={String(item.imageUrl)} alt={String(item.title)} width={600} height={360} />
              <figcaption>{String(item.title)}</figcaption>
            </figure>
          ))}
        </div>
      </article>
    );
  }

  if (section === "support" && slug === "board") {
    const user = await readSession();
    const posts = await getBoard();
    return (
      <article className="article">
        <p className="kicker">고객센터</p>
        <h1>자유게시판</h1>
        {user ? (
          <form action={submitBoard} className="panel form-grid">
            <label>
              제목
              <input name="title" required />
            </label>
            <label>
              내용
              <textarea name="content" required />
            </label>
            <button className="btn btn-primary" type="submit">
              글 등록
            </button>
          </form>
        ) : (
          <p className="alert">글쓰기는 로그인 후 가능합니다.</p>
        )}
        <div className="list">
          {posts.map((item) => (
            <div key={toId(item._id)} className="list-item">
              <h3>{String(item.title)}</h3>
              <div className="meta">{String(item.author)} · {new Date(String(item.createdAt)).toLocaleString("ko-KR")}</div>
              <p>{String(item.content)}</p>
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (section === "support" && slug === "inquiry") {
    const inquiries = await getInquiry();
    return (
      <article className="article">
        <p className="kicker">고객센터</p>
        <h1>문의사항</h1>
        <form action={submitInquiry} className="panel form-grid">
          <label>
            이름
            <input name="name" required />
          </label>
          <label>
            연락처
            <input name="phone" required />
          </label>
          <label>
            분류
            <select name="category" defaultValue="일반 문의">
              <option>일반 문의</option>
              <option>분양 문의</option>
              <option>시설 문의</option>
              <option>기타</option>
            </select>
          </label>
          <label>
            문의 내용
            <textarea name="message" required />
          </label>
          <button className="btn btn-primary" type="submit">
            문의 등록
          </button>
        </form>
        <div className="list">
          {inquiries.map((item) => (
            <div key={toId(item._id)} className="list-item">
              <h3>{String(item.category)}</h3>
              <div className="meta">{String(item.name)} · {String(item.phone)} · {new Date(String(item.createdAt)).toLocaleString("ko-KR")}</div>
              <p>{String(item.message)}</p>
            </div>
          ))}
        </div>
      </article>
    );
  }

  const page = getPage(section, slug);
  if (!page) notFound();

  return (
    <article className="article">
      <p className="kicker">{page.kicker}</p>
      <h1>{page.title}</h1>
      {page.lead ? <p className="lead">{page.lead}</p> : null}
      {page.image ? <Image className="article-image" src={page.image.src} alt={page.image.alt} width={1400} height={840} /> : null}
      {page.blocks.map((block, index) => {
        if (block.type === "p") return <p key={index}>{block.text}</p>;
        if (block.type === "list")
          return (
            <ul key={index}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        if (block.type === "quote")
          return (
            <blockquote key={index} className="quote">
              <p>{block.text}</p>
              {block.cite ? <cite>{block.cite}</cite> : null}
            </blockquote>
          );
        if (block.type === "timeline")
          return (
            <ol key={index} className="timeline">
              {block.items.map((item) => (
                <li key={item.year}>
                  <strong>{item.year}</strong>
                  <div>{item.text}</div>
                </li>
              ))}
            </ol>
          );
        return null;
      })}
      {section === "about" && slug === "location" ? (
        <section className="cards-3">
          <article className="card">
            <h2>지도</h2>
            <iframe
              title="안양공원묘지 지도"
              className="map-frame"
              loading="lazy"
              src="https://maps.google.com/maps?q=%EC%9D%98%EC%99%95%EC%8B%9C%20%EC%B2%AD%EA%B3%84%EB%8F%99%20%EC%82%B08-5&output=embed"
            />
            <p>경기도 의왕시 청계동 산 8-5 일원</p>
          </article>
          <article className="card">
            <h2>대중교통 이용</h2>
            <ul>
              <li>지하철 4호선 인덕원역 하차 후 버스 환승</li>
              <li>경유 정류장: 원터마을, 의왕청계영업소</li>
              <li>주요 노선: 1303, 3330, 7002, 1650</li>
            </ul>
          </article>
          <article className="card">
            <h2>자차 이용</h2>
            <ul>
              <li>내비게이션: 안양시 청계공원묘지 또는 청계동 산 8-5</li>
              <li>성묘철 임시 주차장 운영</li>
              <li>주말 오전은 혼잡하니 9시 이전 도착 권장</li>
            </ul>
          </article>
        </section>
      ) : null}
    </article>
  );
}
