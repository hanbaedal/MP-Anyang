import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../../lib/auth";
import {
  createEntry,
  listAllHalls,
  listMemorialJobs,
  serializeMemorialDoc,
  updateMemorialJob,
} from "../../../../lib/memorial-store";
import { storeMemorialMedia } from "../../../../lib/memorial-media";
import { AdminMemorialClient } from "./AdminMemorialClient";

async function updateJobAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "requested") as "requested" | "in_progress" | "completed" | "rejected";
  const staffNote = String(formData.get("staffNote") || "");
  await updateMemorialJob(id, { status, staffNote });
  revalidatePath("/admin/memorial");
}

async function publishVideoAction(formData: FormData) {
  "use server";
  const admin = await requireAdmin();
  const hallCode = String(formData.get("hallCode") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const jobId = String(formData.get("jobId") || "").trim();
  const file = formData.get("file");

  if (!hallCode || !title || !(file instanceof File) || file.size === 0) {
    redirect("/admin/memorial?error=required");
  }

  const stored = await storeMemorialMedia(file);
  const entryId = await createEntry({
    hallCode,
    type: "edited_video",
    title,
    body,
    mediaUrl: stored.url,
    mediaType: "video",
    eventKind: "staff_edit",
    authorId: admin.id,
    authorName: admin.name,
    status: "published",
  });

  if (jobId) {
    await updateMemorialJob(jobId, { status: "completed", resultEntryId: entryId, staffNote: "편집 영상 게시 완료" });
  }

  revalidatePath("/admin/memorial");
  revalidatePath(`/memorial/${hallCode}`);
  redirect("/admin/memorial?published=1");
}

export default async function AdminMemorialPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string; error?: string }>;
}) {
  await requireAdmin();
  const { published, error } = await searchParams;
  const jobs = (await listMemorialJobs()).map((doc) => {
    const s = serializeMemorialDoc(doc) as Record<string, unknown>;
    return {
      _id: String(s._id),
      hallCode: String(s.hallCode),
      deceasedName: String(s.deceasedName),
      plotNo: String(s.plotNo),
      requesterName: String(s.requesterName),
      status: String(s.status),
      note: String(s.note),
      staffNote: s.staffNote ? String(s.staffNote) : undefined,
      createdAt: String(s.createdAt),
    };
  });
  const halls = await listAllHalls();

  return (
    <article className="article">
      <p className="kicker">관리자</p>
      <h1>사이버 추모관</h1>
      <p className="lead">편집 영상 요청 처리 및 추모관 콘텐츠 관리</p>
      {published && <p className="ok">편집 영상이 추모관에 게시되었습니다.</p>}
      {error && <p className="alert">필수 항목을 입력해 주세요.</p>}

      <section className="panel">
        <h2>등록된 추모관 ({halls.length})</h2>
        {!halls.length ? (
          <p className="meta">회원이 내 추모관에 접속하면 자동 생성됩니다.</p>
        ) : (
          <ul className="memorial-admin-hall-list">
            {halls.slice(0, 20).map((hall) => (
              <li key={hall.code}>
                <a href={`/memorial/${hall.code}`}>{hall.deceasedName}</a>
                <span className="meta"> · {hall.plotNo} · {hall.code}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AdminMemorialClient jobs={jobs} updateJobAction={updateJobAction} publishVideoAction={publishVideoAction} />
    </article>
  );
}
