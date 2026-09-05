import { ObjectId, type Document } from "mongodb";
import { getDb } from "./mongodb";
import { normalizePhone } from "./phone";

export type Relation = {
  deceasedName: string;
  relation: string;
  plotNo: string;
};

export type FeeRecord = {
  year: string;
  amount: number;
  paid: boolean;
  paidAt?: string;
  memo?: string;
};

export function serializeDoc(doc: Document) {
  const { _id, ...rest } = doc;
  return { ...rest, _id: toId(_id) };
}

/* ── helpers ── */
export function toId(v: unknown) {
  if (v instanceof ObjectId) return v.toString();
  return String(v);
}
function oid(id: string) {
  return ObjectId.createFromHexString(id);
}

/* ── 공지사항 ── */
export async function getNotices() {
  const db = await getDb();
  return db.collection("notices").find().sort({ createdAt: -1 }).toArray();
}
export async function createNotice(input: { title: string; content: string; author: string }) {
  const db = await getDb();
  await db.collection("notices").insertOne({ ...input, createdAt: new Date() });
}
export async function updateNotice(id: string, input: { title: string; content: string }) {
  const db = await getDb();
  await db.collection("notices").updateOne({ _id: oid(id) }, { $set: input });
}
export async function deleteNotice(id: string) {
  const db = await getDb();
  await db.collection("notices").deleteOne({ _id: oid(id) });
}

/* ── FAQ ── */
export async function getFaqs() {
  const db = await getDb();
  return db.collection("faqs").find().sort({ order: 1 }).toArray();
}
export async function createFaq(input: { question: string; answer: string }) {
  const db = await getDb();
  const count = await db.collection("faqs").countDocuments();
  await db.collection("faqs").insertOne({ ...input, order: count + 1 });
}
export async function updateFaq(id: string, input: { question: string; answer: string }) {
  const db = await getDb();
  await db.collection("faqs").updateOne({ _id: oid(id) }, { $set: input });
}
export async function deleteFaq(id: string) {
  const db = await getDb();
  await db.collection("faqs").deleteOne({ _id: oid(id) });
}

/* ── 갤러리 ── */
export async function getGallery() {
  const db = await getDb();
  return db.collection("gallery").find().sort({ createdAt: -1 }).toArray();
}
export async function createGalleryItem(input: { title: string; imageUrl: string }) {
  const db = await getDb();
  await db.collection("gallery").insertOne({ ...input, createdAt: new Date() });
}
export async function deleteGalleryItem(id: string) {
  const db = await getDb();
  await db.collection("gallery").deleteOne({ _id: oid(id) });
}

/* ── 자유게시판 ── */
export async function getBoard() {
  const db = await getDb();
  return db.collection("boardPosts").find().sort({ createdAt: -1 }).toArray();
}
export async function createBoardPost(input: { title: string; content: string; author: string; userId: string }) {
  const db = await getDb();
  await db.collection("boardPosts").insertOne({ ...input, createdAt: new Date() });
}
export async function deleteBoardPost(id: string) {
  const db = await getDb();
  await db.collection("boardPosts").deleteOne({ _id: oid(id) });
}

/* ── 문의사항 ── */
export async function getInquiry() {
  const db = await getDb();
  return db.collection("inquiries").find().sort({ createdAt: -1 }).toArray();
}
export async function createInquiry(input: {
  name: string;
  phone: string;
  category: string;
  message: string;
  userId?: string;
}) {
  const db = await getDb();
  await db.collection("inquiries").insertOne({ ...input, createdAt: new Date() });
}
export async function deleteInquiry(id: string) {
  const db = await getDb();
  await db.collection("inquiries").deleteOne({ _id: oid(id) });
}

/* ── 상담 ── */
export async function createConsult(input: { name: string; phone: string; lotType: string; message: string }) {
  const db = await getDb();
  await db.collection("consults").insertOne({ ...input, createdAt: new Date() });
}

/* ── 묘역 검색 ── */
export async function searchGrave(query: string) {
  const db = await getDb();
  const q = query.trim();
  if (!q) return [];
  return db
    .collection("Anyang")
    .find({
      $or: [
        { plotNo: { $regex: q, $options: "i" } },
        { deceasedName: { $regex: q, $options: "i" } },
        { familyName: { $regex: q, $options: "i" } },
      ],
    })
    .limit(20)
    .toArray();
}

/* ── 묘역 CRUD (관리자) ── */
export type GraveInput = {
  plotNo: string;
  deceasedName: string;
  familyName: string;
  zone: string;
  type: string;
  buriedAt: string;
  mapNote?: string;
  photos?: string[];
  mapImage?: string;
  lastInspectedAt?: string;
  inspectNote?: string;
};

export async function getGraves() {
  const db = await getDb();
  return db.collection("Anyang").find().sort({ plotNo: 1 }).toArray();
}

export async function getGravesByPlotNos(plotNos: string[]) {
  const db = await getDb();
  const unique = [...new Set(plotNos.map((v) => v.trim()).filter(Boolean))];
  if (!unique.length) return [];
  return db.collection("Anyang").find({ plotNo: { $in: unique } }).toArray();
}

export async function createGrave(input: GraveInput) {
  const db = await getDb();
  await db.collection("Anyang").insertOne({
    ...input,
    photos: (input.photos || []).slice(0, 10),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateGrave(id: string, input: Partial<GraveInput>) {
  const db = await getDb();
  const $set: Record<string, unknown> = { ...input, updatedAt: new Date() };
  if (input.photos) $set.photos = input.photos.slice(0, 10);
  await db.collection("Anyang").updateOne({ _id: oid(id) }, { $set });
}

export async function deleteGrave(id: string) {
  const db = await getDb();
  await db.collection("Anyang").deleteOne({ _id: oid(id) });
}

/* ── 공원 풍광 ── */
export async function getParkPhotos() {
  const db = await getDb();
  return db.collection("parkPhotos").find().sort({ createdAt: -1 }).toArray();
}

export async function createParkPhoto(input: { title: string; imageUrl: string; season?: string }) {
  const db = await getDb();
  await db.collection("parkPhotos").insertOne({ ...input, createdAt: new Date() });
}

export async function deleteParkPhoto(id: string) {
  const db = await getDb();
  await db.collection("parkPhotos").deleteOne({ _id: oid(id) });
}

/* ── 사용자 ── */
export async function findUserByUsername(username: string) {
  const db = await getDb();
  return db.collection("users").findOne({ username: username.trim() });
}

export async function findUserById(id: string) {
  const db = await getDb();
  return db.collection("users").findOne({ _id: oid(id) });
}

export async function findUserByPhoneAndName(phone: string, name: string) {
  const db = await getDb();
  return db.collection("users").findOne({ phone: normalizePhone(phone), name: name.trim() });
}

export async function findUserByKakao(kakaoId: string) {
  const db = await getDb();
  return db.collection("users").findOne({ kakaoId });
}

export async function findUserByGoogle(googleId: string) {
  const db = await getDb();
  return db.collection("users").findOne({ googleId });
}

export async function listMembers() {
  const db = await getDb();
  return db.collection("users").find({ role: { $ne: "admin" } }).sort({ createdAt: -1 }).toArray();
}

export async function usernameExists(username: string) {
  const db = await getDb();
  return Boolean(await db.collection("users").findOne({ username }));
}

export async function phoneExists(phone: string) {
  const db = await getDb();
  return Boolean(await db.collection("users").findOne({ phone: normalizePhone(phone) }));
}

export async function createMember(input: {
  username: string;
  passwordHash: string;
  name: string;
  phone: string;
  email: string;
  plotNo: string;
  address?: string;
  emergencyPhone?: string;
  carNumber?: string;
  contractNo?: string;
  registeredAt: string;
  relations: Relation[];
  annualFee?: number;
  kakaoId?: string;
  googleId?: string;
  smsConsent?: boolean;
  marketingSmsConsent?: boolean;
  smsConsentAt?: Date | null;
}) {
  const db = await getDb();
  const result = await db.collection("users").insertOne({
    ...input,
    phone: normalizePhone(input.phone),
    emergencyPhone: input.emergencyPhone ? normalizePhone(input.emergencyPhone) : "",
    role: "member",
    feeStatus: "미납",
    feeHistory: [] as FeeRecord[],
    smsConsent: Boolean(input.smsConsent),
    marketingSmsConsent: Boolean(input.marketingSmsConsent),
    smsConsentAt: input.smsConsentAt ?? null,
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function createOAuthMember(input: {
  username: string;
  name: string;
  email: string;
  kakaoId?: string;
  googleId?: string;
}) {
  const db = await getDb();
  const result = await db.collection("users").insertOne({
    username: input.username,
    passwordHash: "",
    name: input.name,
    phone: "",
    email: input.email,
    plotNo: "",
    relations: [],
    registeredAt: new Date().toISOString().slice(0, 10),
    role: "member",
    feeStatus: "미납",
    feeHistory: [],
    kakaoId: input.kakaoId || "",
    googleId: input.googleId || "",
    smsConsent: false,
    marketingSmsConsent: false,
    smsConsentAt: null,
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function updateMember(id: string, input: Record<string, unknown>) {
  const db = await getDb();
  const data = { ...input };
  if (typeof data.phone === "string") data.phone = normalizePhone(data.phone);
  if (typeof data.emergencyPhone === "string") data.emergencyPhone = normalizePhone(data.emergencyPhone);
  await db.collection("users").updateOne({ _id: oid(id) }, { $set: { ...data, updatedAt: new Date() } });
}

export async function deleteMember(id: string) {
  const db = await getDb();
  await db.collection("users").deleteOne({ _id: oid(id), role: { $ne: "admin" } });
}

export async function setResetToken(userId: string, token: string, expiresAt: Date) {
  const db = await getDb();
  await db.collection("users").updateOne({ _id: oid(userId) }, { $set: { resetToken: token, resetExpires: expiresAt } });
}

export async function findUserByResetToken(token: string) {
  const db = await getDb();
  return db.collection("users").findOne({ resetToken: token, resetExpires: { $gt: new Date() } });
}

export async function updatePassword(userId: string, passwordHash: string) {
  const db = await getDb();
  await db.collection("users").updateOne(
    { _id: oid(userId) },
    { $set: { passwordHash }, $unset: { resetToken: "", resetExpires: "" } },
  );
}
