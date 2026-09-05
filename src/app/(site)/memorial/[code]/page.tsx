import Link from "next/link";
import { redirect } from "next/navigation";
import { MemorialHallClient } from "../../../../components/MemorialHallClient";
import { readSession } from "../../../../lib/auth";
import { detectMemorialEvents } from "../../../../lib/memorial-events";
import {
  findHallByCode,
  listEntries,
  listMemorialJobsByHall,
  memberCanEditHall,
  serializeMemorialDoc,
  syncHall,
} from "../../../../lib/memorial-store";
import { findGraveByPlotNo } from "../../../../lib/store";

export default async function MemorialHallPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const session = await readSession();

  let hall = await findHallByCode(code);
  if (!hall) {
    return (
      <article className="article">
        <h1>추모관을 찾을 수 없습니다</h1>
        <p className="meta">코드가 올바른지 확인해 주세요.</p>
        <Link href="/memorial" className="btn">
          사이버 추모관 소개
        </Link>
      </article>
    );
  }

  if (session) {
    await syncHall(hall);
    hall = (await findHallByCode(code))!;
  }

  const canView =
    !session && hall.visibility === "public"
      ? true
      : session
        ? await memberCanEditHall(session.id, session.role, hall) || hall.visibility === "public"
        : false;

  if (!canView) {
    redirect(`/login?next=${encodeURIComponent(`/memorial/${code}`)}`);
  }

  const canEdit = session ? await memberCanEditHall(session.id, session.role, hall) : false;
  const includePending = session?.role === "admin";
  const rawEntries = await listEntries(code, includePending);
  const grave = hall.plotNo ? await findGraveByPlotNo(hall.plotNo) : null;
  const recallPhotos = ((grave?.photos as string[] | undefined) || []).filter(Boolean).slice(0, 10);
  const rawJobs = await listMemorialJobsByHall(code);
  const jobs = rawJobs.map((doc) => {
    const s = serializeMemorialDoc(doc) as Record<string, unknown>;
    return {
      _id: String(s._id),
      status: String(s.status),
      note: String(s.note),
      staffNote: s.staffNote ? String(s.staffNote) : undefined,
      createdAt: String(s.createdAt),
    };
  });
  const entries = rawEntries.map((doc) => {
    const s = serializeMemorialDoc(doc) as Record<string, unknown>;
    return {
      _id: String(s._id),
      type: String(s.type),
      title: String(s.title),
      body: s.body ? String(s.body) : undefined,
      mediaUrl: s.mediaUrl ? String(s.mediaUrl) : undefined,
      mediaType: s.mediaType ? String(s.mediaType) : undefined,
      eventKind: s.eventKind ? String(s.eventKind) : undefined,
      eventDate: s.eventDate ? String(s.eventDate) : undefined,
      authorName: String(s.authorName),
      createdAt: String(s.createdAt),
    };
  });

  const upcoming = detectMemorialEvents({ deathDate: hall.deathDate, birthDate: hall.birthDate }).slice(0, 3);

  return (
    <article className="article memorial-article">
      {upcoming.length > 0 && (
        <div className="panel memorial-upcoming">
          <h2 className="memorial-upcoming-title">다가오는 추모 일정</h2>
          <ul>
            {upcoming.map((ev) => (
              <li key={ev.kind + ev.eventDate}>
                <strong>{ev.label}</strong> · {ev.eventDate}
                {ev.daysUntil === 0 ? " (오늘)" : ev.daysUntil > 0 ? ` (${ev.daysUntil}일 후)` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
      <MemorialHallClient
        hallCode={hall.code}
        deceasedName={hall.deceasedName}
        plotNo={hall.plotNo}
        deathDate={hall.deathDate}
        canEdit={canEdit}
        recallPhotos={recallPhotos}
        entries={entries}
        jobs={jobs}
      />
    </article>
  );
}
