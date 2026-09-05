import { ObjectId, type Document } from "mongodb";
import { detectMemorialEvents } from "./memorial-events";
import { getDb } from "./mongodb";
import { findGraveByPlotNo, toId } from "./store";
import type { Relation } from "./store";

export type MemorialHallDoc = {
  code: string;
  plotNo: string;
  deceasedName: string;
  memberIds: string[];
  visibility: "private" | "family" | "public";
  deathDate?: string;
  birthDate?: string;
  coverUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MemorialEntryDoc = {
  hallCode: string;
  type: "photo" | "video" | "text" | "grave_snapshot" | "event" | "edited_video";
  title: string;
  body?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  eventKind?: string;
  eventDate?: string;
  authorId: string;
  authorName: string;
  status: "published" | "pending" | "draft";
  createdAt: Date;
};

export type MemorialJobDoc = {
  hallCode: string;
  deceasedName: string;
  plotNo: string;
  requestedBy: string;
  requesterName: string;
  status: "requested" | "in_progress" | "completed" | "rejected";
  note: string;
  staffNote?: string;
  resultEntryId?: string;
  createdAt: Date;
  updatedAt: Date;
};

function oid(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new Error("잘못된 ID입니다.");
  }
  return ObjectId.createFromHexString(id);
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 6);
}

export function makeHallCode(plotNo: string, deceasedName: string) {
  const plot = plotNo.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "PLOT";
  const name = deceasedName.trim().slice(0, 8) || "MEM";
  return `M-${plot}-${name}-${randomSuffix()}`;
}

export async function findHallByCode(code: string) {
  const db = await getDb();
  return db.collection<MemorialHallDoc>("memorialHalls").findOne({ code: code.trim() });
}

export async function listHallsForMember(memberId: string) {
  const db = await getDb();
  return db.collection<MemorialHallDoc>("memorialHalls").find({ memberIds: memberId }).sort({ deceasedName: 1 }).toArray();
}

export async function listAllHalls() {
  const db = await getDb();
  return db.collection<MemorialHallDoc>("memorialHalls").find().sort({ updatedAt: -1 }).toArray();
}

export async function createHall(input: Omit<MemorialHallDoc, "createdAt" | "updatedAt">) {
  const db = await getDb();
  const now = new Date();
  await db.collection("memorialHalls").insertOne({ ...input, createdAt: now, updatedAt: now });
}

export async function ensureHallForRelation(memberId: string, rel: Relation, deathDate?: string) {
  if (!rel.deceasedName.trim() && !rel.plotNo.trim()) return null;

  const db = await getDb();
  const halls = db.collection<MemorialHallDoc>("memorialHalls");
  const plotNo = rel.plotNo.trim();
  const deceasedName = rel.deceasedName.trim();
  const existing = await halls.findOne({ plotNo, deceasedName });
  if (existing) {
    if (!existing.memberIds.includes(memberId)) {
      await halls.updateOne({ code: existing.code }, { $addToSet: { memberIds: memberId }, $set: { updatedAt: new Date() } });
      return { ...existing, memberIds: [...existing.memberIds, memberId] };
    }
    return existing;
  }

  const grave = rel.plotNo ? await findGraveByPlotNo(rel.plotNo) : null;
  const code = makeHallCode(rel.plotNo || "NA", rel.deceasedName || "고인");
  const hall: MemorialHallDoc = {
    code,
    plotNo: rel.plotNo.trim(),
    deceasedName: rel.deceasedName.trim() || String(grave?.deceasedName || "고인"),
    memberIds: [memberId],
    visibility: "family",
    deathDate: deathDate || String(grave?.buriedAt || ""),
    coverUrl: Array.isArray(grave?.photos) ? String(grave.photos[0] || "") : "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await halls.insertOne(hall);
  return hall;
}

export async function ensureMemberMemorialHalls(memberId: string, relations: Relation[]) {
  const halls: MemorialHallDoc[] = [];
  for (const rel of relations) {
    const hall = await ensureHallForRelation(memberId, rel);
    if (hall) halls.push(hall);
  }
  return halls;
}

export async function memberCanEditHall(memberId: string, role: string, hall: MemorialHallDoc) {
  if (role === "admin") return true;
  return hall.memberIds.includes(memberId);
}

export async function listEditedVideoEntries() {
  const db = await getDb();
  return db
    .collection<MemorialEntryDoc>("memorialEntries")
    .find({ type: "edited_video", status: "published" })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function listEntries(hallCode: string, includePending = false) {
  const db = await getDb();
  const filter: Record<string, unknown> = { hallCode };
  if (!includePending) filter.status = "published";
  return db
    .collection<MemorialEntryDoc>("memorialEntries")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
}

export async function findEntryById(id: string) {
  const db = await getDb();
  return db.collection<MemorialEntryDoc>("memorialEntries").findOne({ _id: oid(id) });
}

export async function createEntry(input: Omit<MemorialEntryDoc, "createdAt">) {
  const db = await getDb();
  const now = new Date();
  const result = await db.collection("memorialEntries").insertOne({ ...input, createdAt: now });
  await db.collection("memorialHalls").updateOne({ code: input.hallCode }, { $set: { updatedAt: now } });
  return toId(result.insertedId);
}

export async function updateEntryStatus(id: string, status: MemorialEntryDoc["status"]) {
  const db = await getDb();
  await db.collection("memorialEntries").updateOne({ _id: oid(id) }, { $set: { status } });
}

export async function entryExistsForEvent(hallCode: string, eventKind: string, eventDate: string) {
  const db = await getDb();
  return Boolean(
    await db.collection("memorialEntries").findOne({
      hallCode,
      eventKind,
      eventDate,
      type: { $in: ["event", "grave_snapshot"] },
    }),
  );
}

/** 묘역 점검 사진 → 추모관 타임라인 자동 반영 */
export async function syncGravePhotosToHall(hall: MemorialHallDoc, authorId = "system", authorName = "안양공원") {
  if (!hall.plotNo) return 0;
  const grave = await findGraveByPlotNo(hall.plotNo);
  if (!grave) return 0;

  const photos = (grave.photos as string[] | undefined) || [];
  const inspected = String(grave.lastInspectedAt || grave.updatedAt || "").slice(0, 10) || new Date().toISOString().slice(0, 10);
  let added = 0;

  for (const url of photos.filter(Boolean).slice(0, 5)) {
    const key = `grave:${hall.plotNo}:${url.slice(-24)}:${inspected}`;
    const db = await getDb();
    const exists = await db.collection("memorialEntries").findOne({ hallCode: hall.code, body: key });
    if (exists) continue;

    await createEntry({
      hallCode: hall.code,
      type: "grave_snapshot",
      title: `${hall.plotNo} 묘역 현황`,
      body: key,
      mediaUrl: url,
      mediaType: "image",
      eventKind: "grave_inspection",
      eventDate: inspected,
      authorId,
      authorName,
      status: "published",
    });
    added += 1;
  }
  return added;
}

/** 기일·명절 이벤트 콘텐츠 자동 생성 */
export async function syncEventEntriesForHall(hall: MemorialHallDoc) {
  const events = detectMemorialEvents({ deathDate: hall.deathDate, birthDate: hall.birthDate });
  let added = 0;

  for (const ev of events) {
    if (await entryExistsForEvent(hall.code, ev.kind, ev.eventDate)) continue;

    const title =
      ev.daysUntil === 0
        ? `${ev.label} 추모의 날`
        : ev.daysUntil > 0
          ? `${ev.label} ${ev.daysUntil}일 전`
          : `${ev.label} ${Math.abs(ev.daysUntil)}일 지남`;

    await createEntry({
      hallCode: hall.code,
      type: "event",
      title,
      body: `${hall.deceasedName}님의 ${ev.label}(${ev.eventDate})에 맞춰 추모관이 갱신되었습니다.`,
      eventKind: ev.kind,
      eventDate: ev.eventDate,
      authorId: "system",
      authorName: "추모 이벤트",
      status: "published",
    });
    added += 1;

    if (ev.kind !== "grave_inspection") {
      await syncGravePhotosToHall(hall, "system", "묘역 연동");
    }
  }
  return added;
}

export async function syncHall(hall: MemorialHallDoc) {
  const a = await syncGravePhotosToHall(hall);
  const b = await syncEventEntriesForHall(hall);
  return a + b;
}

/* ── 편집 영상 요청 (운영 워크플로) ── */
export async function createMemorialJob(input: Omit<MemorialJobDoc, "createdAt" | "updatedAt" | "status">) {
  const db = await getDb();
  const now = new Date();
  const result = await db.collection("memorialJobs").insertOne({
    ...input,
    status: "requested",
    createdAt: now,
    updatedAt: now,
  });
  return toId(result.insertedId);
}

export async function listMemorialJobs(status?: MemorialJobDoc["status"]) {
  const db = await getDb();
  const filter = status ? { status } : {};
  return db.collection<MemorialJobDoc>("memorialJobs").find(filter).sort({ createdAt: -1 }).toArray();
}

export async function listMemorialJobsByHall(hallCode: string) {
  const db = await getDb();
  return db.collection<MemorialJobDoc>("memorialJobs").find({ hallCode }).sort({ createdAt: -1 }).toArray();
}

export async function findMemorialJob(id: string) {
  const db = await getDb();
  return db.collection<MemorialJobDoc>("memorialJobs").findOne({ _id: oid(id) });
}

export async function updateMemorialJob(
  id: string,
  patch: Partial<Pick<MemorialJobDoc, "status" | "staffNote" | "resultEntryId">>,
) {
  const db = await getDb();
  await db.collection("memorialJobs").updateOne({ _id: oid(id) }, { $set: { ...patch, updatedAt: new Date() } });
}

export function serializeMemorialDoc(doc: Document) {
  const { _id, ...rest } = doc;
  return { ...rest, _id: toId(_id) };
}
