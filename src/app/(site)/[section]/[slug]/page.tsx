import Image from "next/image";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getPage, slugsOf } from "../../../../lib/content";
import {
  createBoardPost, createFaq, createGalleryItem, createInquiry, createNotice,
  deleteBoardPost, deleteFaq, deleteGalleryItem, deleteInquiry, deleteNotice,
  getBoard, getFaqs, getGallery, getInquiry, getNotices,
  toId, updateFaq, updateNotice,
} from "../../../../lib/store";
import { readSession } from "../../../../lib/auth";

type Params = { section: string; slug: string };

export const dynamic = "force-dynamic";
export const dynamicParams = true;

function dbErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "데이터베이스 연결에 실패했습니다.";
}

/* ── Server Actions ── */

async function addNotice(formData: FormData) {
  "use server";
  const user = await readSession();
  if (!user || user.role !== "admin") return;
  await createNotice({
    title: String(formData.get("title") || ""),
    content: String(formData.get("content") || ""),
    author: user.name,
  });
  revalidatePath("/support/notices");
  redirect("/support/notices");
}

async function removeNotice(formData: FormData) {
  "use server";
  const user = await readSession();
  if (!user || user.role !== "admin") return;
  await deleteNotice(String(formData.get("id")));
  revalidatePath("/support/notices");
  redirect("/support/notices");
}

async function editNotice(formData: FormData) {
  "use server";
  const user = await readSession();
  if (!user || user.role !== "admin") return;
  await updateNotice(String(formData.get("id")), {
    title: String(formData.get("title") || ""),
    content: String(formData.get("content") || ""),
  });
  revalidatePath("/support/notices");
  redirect("/support/notices");
}

async function addFaq(formData: FormData) {
  "use server";
  const user = await readSession();
  if (!user || user.role !== "admin") return;
  await createFaq({
    question: String(formData.get("question") || ""),
    answer: String(formData.get("answer") || ""),
  });
  revalidatePath("/support/faq");
  redirect("/support/faq");
}

async function removeFaq(formData: FormData) {
  "use server";
  const user = await readSession();
  if (!user || user.role !== "admin") return;
  await deleteFaq(String(formData.get("id")));
  revalidatePath("/support/faq");
  redirect("/support/faq");
}

async function addGalleryAction(formData: FormData) {
  "use server";
  const user = await readSession();
  if (!user || user.role !== "admin") return;
  await createGalleryItem({
    title: String(formData.get("title") || ""),
    imageUrl: String(formData.get("imageUrl") || ""),
  });
  revalidatePath("/support/gallery");
  redirect("/support/gallery");
}

async function removeGallery(formData: FormData) {
  "use server";
  const user = await readSession();
  if (!user || user.role !== "admin") return;
  await deleteGalleryItem(String(formData.get("id")));
  revalidatePath("/support/gallery");
  redirect("/support/gallery");
}

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
  revalidatePath("/support/board");
  redirect("/support/board");
}

async function removeBoard(formData: FormData) {
  "use server";
  const user = await readSession();
  if (!user || user.role !== "admin") return;
  await deleteBoardPost(String(formData.get("id")));
  revalidatePath("/support/board");
  redirect("/support/board");
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
  revalidatePath("/support/inquiry");
  redirect("/support/inquiry");
}

async function removeInquiry(formData: FormData) {
  "use server";
  const user = await readSession();
  if (!user || user.role !== "admin") return;
  await deleteInquiry(String(formData.get("id")));
  revalidatePath("/support/inquiry");
  redirect("/support/inquiry");
}

/* ── Page Component ── */

export default async function SectionPage({ params }: { params: Promise<Params> }) {
  const { section, slug } = await params;
  const user = await readSession();
  const isAdmin = user?.role === "admin";

  /* ── 공지사항 ── */
  if (section === "support" && slug === "notices") {
    let notices: Awaited<ReturnType<typeof getNotices>> = [];
    let loadError = "";
    try {
      notices = await getNotices();
    } catch (error) {
      console.error("[support/notices]", error);
      loadError = dbErrorMessage(error);
    }
    return (
      <article className="article">
        <p className="kicker">고객센터</p>
        <h1>공지사항</h1>
        {loadError ? <p className="alert">목록을 불러오지 못했습니다. ({loadError})</p> : null}

        {isAdmin && (
          <form action={addNotice} className="panel form-grid admin-form">
            <p className="admin-badge">관리자</p>
            <label>제목<input name="title" required /></label>
            <label>내용<textarea name="content" required /></label>
            <button className="btn btn-primary" type="submit">공지 등록</button>
          </form>
        )}

        <div className="list">
          {notices.map((item) => (
            <div key={toId(item._id)} className="list-item">
              <h3>{String(item.title)}</h3>
              <div className="meta">
                {new Date(String(item.createdAt)).toLocaleDateString("ko-KR")}
                {item.author ? ` · ${String(item.author)}` : ""}
              </div>
              <p>{String(item.content)}</p>
              {isAdmin && (
                <div className="admin-actions">
                  <form action={removeNotice}>
                    <input type="hidden" name="id" value={toId(item._id)} />
                    <button className="btn btn-danger btn-sm" type="submit">삭제</button>
                  </form>
                </div>
              )}
            </div>
          ))}
          {notices.length === 0 && <p className="alert">등록된 공지사항이 없습니다.</p>}
        </div>
      </article>
    );
  }

  /* ── FAQ ── */
  if (section === "support" && slug === "faq") {
    let faqs: Awaited<ReturnType<typeof getFaqs>> = [];
    let loadError = "";
    try {
      faqs = await getFaqs();
    } catch (error) {
      console.error("[support/faq]", error);
      loadError = dbErrorMessage(error);
    }
    return (
      <article className="article">
        <p className="kicker">고객센터</p>
        <h1>자주묻는 질문</h1>
        {loadError ? <p className="alert">목록을 불러오지 못했습니다. ({loadError})</p> : null}

        {isAdmin && (
          <form action={addFaq} className="panel form-grid admin-form">
            <p className="admin-badge">관리자</p>
            <label>질문<input name="question" required /></label>
            <label>답변<textarea name="answer" required /></label>
            <button className="btn btn-primary" type="submit">FAQ 등록</button>
          </form>
        )}

        <div className="list">
          {faqs.map((item) => (
            <div key={toId(item._id)} className="list-item">
              <h3>Q. {String(item.question)}</h3>
              <p>A. {String(item.answer)}</p>
              {isAdmin && (
                <div className="admin-actions">
                  <form action={removeFaq}>
                    <input type="hidden" name="id" value={toId(item._id)} />
                    <button className="btn btn-danger btn-sm" type="submit">삭제</button>
                  </form>
                </div>
              )}
            </div>
          ))}
          {faqs.length === 0 && <p className="alert">등록된 FAQ가 없습니다.</p>}
        </div>
      </article>
    );
  }

  /* ── 갤러리 ── */
  if (section === "support" && slug === "gallery") {
    let gallery: Awaited<ReturnType<typeof getGallery>> = [];
    let loadError = "";
    try {
      gallery = await getGallery();
    } catch (error) {
      console.error("[support/gallery]", error);
      loadError = dbErrorMessage(error);
    }
    return (
      <article className="article">
        <p className="kicker">고객센터</p>
        <h1>갤러리</h1>
        {loadError ? <p className="alert">목록을 불러오지 못했습니다. ({loadError})</p> : null}

        {isAdmin && (
          <form action={addGalleryAction} className="panel form-grid admin-form">
            <p className="admin-badge">관리자</p>
            <label>제목<input name="title" required /></label>
            <label>이미지 URL<input name="imageUrl" required placeholder="https://..." /></label>
            <button className="btn btn-primary" type="submit">갤러리 등록</button>
          </form>
        )}

        <div className="gallery-grid">
          {gallery.map((item) => (
            <figure key={toId(item._id)}>
              <Image src={String(item.imageUrl)} alt={String(item.title)} width={600} height={360} unoptimized />
              <figcaption>{String(item.title)}</figcaption>
              {isAdmin && (
                <form action={removeGallery} className="admin-actions">
                  <input type="hidden" name="id" value={toId(item._id)} />
                  <button className="btn btn-danger btn-sm" type="submit">삭제</button>
                </form>
              )}
            </figure>
          ))}
          {gallery.length === 0 && <p className="alert">등록된 갤러리가 없습니다.</p>}
        </div>
      </article>
    );
  }

  /* ── 자유게시판 ── */
  if (section === "support" && slug === "board") {
    let posts: Awaited<ReturnType<typeof getBoard>> = [];
    let loadError = "";
    try {
      posts = await getBoard();
    } catch (error) {
      console.error("[support/board]", error);
      loadError = dbErrorMessage(error);
    }
    return (
      <article className="article">
        <p className="kicker">고객센터</p>
        <h1>자유게시판</h1>
        {loadError ? <p className="alert">목록을 불러오지 못했습니다. ({loadError})</p> : null}

        {user ? (
          <form action={submitBoard} className="panel form-grid">
            <label>제목<input name="title" required /></label>
            <label>내용<textarea name="content" required /></label>
            <button className="btn btn-primary" type="submit">글 등록</button>
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
              {isAdmin && (
                <div className="admin-actions">
                  <form action={removeBoard}>
                    <input type="hidden" name="id" value={toId(item._id)} />
                    <button className="btn btn-danger btn-sm" type="submit">삭제</button>
                  </form>
                </div>
              )}
            </div>
          ))}
          {posts.length === 0 && <p className="alert">게시글이 없습니다.</p>}
        </div>
      </article>
    );
  }

  /* ── 문의사항 ── */
  if (section === "support" && slug === "inquiry") {
    let inquiries: Awaited<ReturnType<typeof getInquiry>> = [];
    let loadError = "";
    try {
      inquiries = await getInquiry();
    } catch (error) {
      console.error("[support/inquiry]", error);
      loadError = dbErrorMessage(error);
    }
    return (
      <article className="article">
        <p className="kicker">고객센터</p>
        <h1>문의사항</h1>
        {loadError ? <p className="alert">목록을 불러오지 못했습니다. ({loadError})</p> : null}

        <form action={submitInquiry} className="panel form-grid">
          <label>이름<input name="name" required /></label>
          <label>연락처<input name="phone" required /></label>
          <label>분류
            <select name="category" defaultValue="일반 문의">
              <option>일반 문의</option>
              <option>분양 문의</option>
              <option>시설 문의</option>
              <option>기타</option>
            </select>
          </label>
          <label>문의 내용<textarea name="message" required /></label>
          <button className="btn btn-primary" type="submit">문의 등록</button>
        </form>

        <div className="list">
          {inquiries.map((item) => (
            <div key={toId(item._id)} className="list-item">
              <h3>{String(item.category)}</h3>
              <div className="meta">{String(item.name)} · {String(item.phone)} · {new Date(String(item.createdAt)).toLocaleString("ko-KR")}</div>
              <p>{String(item.message)}</p>
              {isAdmin && (
                <div className="admin-actions">
                  <form action={removeInquiry}>
                    <input type="hidden" name="id" value={toId(item._id)} />
                    <button className="btn btn-danger btn-sm" type="submit">삭제</button>
                  </form>
                </div>
              )}
            </div>
          ))}
          {inquiries.length === 0 && <p className="alert">등록된 문의가 없습니다.</p>}
        </div>
      </article>
    );
  }

  /* ── 정적 페이지 (재단소개, 분양, 시설, 서비스) ── */
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
