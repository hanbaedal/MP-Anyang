import Link from "next/link";
import { guardAdminPage } from "../../../../lib/auth";
import { listAllHalls, listMemorialJobs, serializeMemorialDoc } from "../../../../lib/memorial-store";
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
  searchParams: Promise<{ published?: string; error?: string }>;
}) {
  await guardAdminPage("/admin/memorial");
  const { published, error } = await searchParams;

  let jobs: {
    _id: string;
    hallCode: string;
    deceasedName: string;
    plotNo: string;
    requesterName: string;
    status: string;
    note: string;
    staffNote?: string;
    createdAt: string;
  }[] = [];
  let halls: Awaited<ReturnType<typeof listAllHalls>> = [];
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
    halls = await listAllHalls();
  } catch (err) {
    console.error("[admin/memorial]", err);
    loadError = dbErrorMessage(err);
  }

  return (
    <article className="article">
      <p className="kicker">관리자</p>
      <h1>사이버 추모관</h1>
      <p className="lead">편집 영상 요청 처리 및 추모관 콘텐츠 관리</p>
      {published && <p className="ok">편집 영상이 추모관에 게시되었습니다.</p>}
      {error && <p className="alert">필수 항목을 입력해 주세요.</p>}
      {loadError && <p className="alert">목록을 불러오지 못했습니다. ({loadError})</p>}

      <section className="panel">
        <h2>등록된 추모관 ({halls.length})</h2>
        {!halls.length ? (
          <p className="meta">회원이 내 추모관에 접속하면 자동 생성됩니다.</p>
        ) : (
          <ul className="memorial-admin-hall-list">
            {halls.slice(0, 20).map((hall) => (
              <li key={hall.code}>
                <Link href={`/memorial/${hall.code}`}>{hall.deceasedName}</Link>
                <span className="meta">
                  {" "}
                  · {hall.plotNo} · {hall.code}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AdminMemorialClient jobs={jobs} updateJobAction={updateJobAction} publishVideoAction={publishVideoAction} />
    </article>
  );
}
