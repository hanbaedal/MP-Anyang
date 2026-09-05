import { Suspense } from "react";
import { guardAdminPage } from "../../../../lib/auth";
import {
  listAllHalls,
  listEditedVideoEntries,
  listMemorialJobs,
  serializeMemorialDoc,
} from "../../../../lib/memorial-store";
import { AdminMemorialClient } from "./AdminMemorialClient";
import { publishVideoAction, updateJobAction } from "./actions";

export const dynamic = "force-dynamic";

function dbErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "데이터를 불러오지 못했습니다.";
}

export default async function AdminMemorialPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string; error?: string; tab?: string }>;
}) {
  await guardAdminPage("/admin/memorial");
  const { published, error } = await searchParams;

  let jobs: Parameters<typeof AdminMemorialClient>[0]["jobs"] = [];
  let halls: Parameters<typeof AdminMemorialClient>[0]["halls"] = [];
  let publishedVideos: Parameters<typeof AdminMemorialClient>[0]["published"] = [];
  let loadError = "";

  try {
    jobs = (await listMemorialJobs()).map((doc) => {
      const s = serializeMemorialDoc(doc) as Record<string, unknown>;
      return {
        _id: String(s._id ?? ""),
        hallCode: String(s.hallCode ?? ""),
        deceasedName: String(s.deceasedName ?? ""),
        plotNo: String(s.plotNo ?? ""),
        requesterName: String(s.requesterName ?? ""),
        status: String(s.status ?? "requested"),
        note: String(s.note ?? ""),
        staffNote: s.staffNote ? String(s.staffNote) : undefined,
        createdAt: s.createdAt ? new Date(String(s.createdAt)).toISOString() : "",
      };
    });

    halls = (await listAllHalls()).map((hall) => ({
      code: String(hall.code),
      plotNo: String(hall.plotNo ?? ""),
      deceasedName: String(hall.deceasedName ?? ""),
      visibility: String(hall.visibility ?? "family"),
      updatedAt: hall.updatedAt ? new Date(String(hall.updatedAt)).toISOString() : "",
    }));

    publishedVideos = (await listEditedVideoEntries()).map((doc) => {
      const s = serializeMemorialDoc(doc) as Record<string, unknown>;
      return {
        _id: String(s._id ?? ""),
        hallCode: String(s.hallCode ?? ""),
        title: String(s.title ?? ""),
        body: s.body ? String(s.body) : undefined,
        mediaUrl: s.mediaUrl ? String(s.mediaUrl) : undefined,
        mediaType: s.mediaType ? String(s.mediaType) : undefined,
        authorName: String(s.authorName ?? ""),
        createdAt: s.createdAt ? new Date(String(s.createdAt)).toISOString() : "",
      };
    });
  } catch (err) {
    console.error("[admin/memorial]", err);
    loadError = dbErrorMessage(err);
  }

  return (
    <article className="article admin-memorial-page">
      <p className="kicker">관리자</p>
      <h1>사이버 추모관</h1>
      <p className="lead">추모관·편집 영상 요청·게시를 관리합니다.</p>
      {published && <p className="ok">편집 영상이 추모관에 게시되었습니다.</p>}
      {error && <p className="alert">필수 항목을 입력해 주세요.</p>}
      {loadError && <p className="alert">목록을 불러오지 못했습니다. ({loadError})</p>}

      <Suspense fallback={<p className="meta">불러오는 중…</p>}>
        <AdminMemorialClient
          halls={halls}
          jobs={jobs}
          published={publishedVideos}
          updateJobAction={updateJobAction}
          publishVideoAction={publishVideoAction}
        />
      </Suspense>
    </article>
  );
}
