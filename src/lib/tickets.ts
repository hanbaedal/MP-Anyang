import { ObjectId, type Db, type Document } from "mongodb";
import { getDb } from "./mongodb";
import { normalizePhone } from "./phone";

export type TicketSource = "consult" | "inquiry" | "side-cta" | "memorial";
export type TicketStatus = "pending" | "in_progress" | "done";

export type TicketInput = {
  name: string;
  phone: string;
  category: string;
  message: string;
  source?: TicketSource;
  userId?: string;
  lotType?: string;
  lotCapacity?: string;
  estimatedAnnualFee?: number;
  estimatedSalePrice?: number;
};

export type TicketRow = {
  id: string;
  name: string;
  phone: string;
  category: string;
  message: string;
  source: TicketSource;
  sourceLabel: string;
  status: TicketStatus;
  userId?: string;
  assignee?: string;
  reply?: string;
  lotType?: string;
  lotCapacity?: string;
  estimatedAnnualFee?: number;
  estimatedSalePrice?: number;
  createdAt: string;
  updatedAt: string;
  repliedAt?: string;
};

export const TICKET_PAGE_SIZE = 50;

export const TICKET_SOURCE_LABELS: Record<TicketSource, string> = {
  consult: "상담신청",
  inquiry: "문의사항",
  "side-cta": "빠른 상담",
  memorial: "추모 대행",
};

const META_MIGRATION_KEY = "ticketMigration";

function oid(id: string) {
  return ObjectId.createFromHexString(id);
}

function toId(v: unknown) {
  if (v instanceof ObjectId) return v.toString();
  return String(v);
}

function normalizeSource(value: unknown): TicketSource {
  const key = String(value || "consult");
  if (key in TICKET_SOURCE_LABELS) return key as TicketSource;
  return "consult";
}

function normalizeStatus(value: unknown): TicketStatus {
  if (value === "in_progress" || value === "done") return value;
  return "pending";
}

function mapTicket(doc: Document): TicketRow {
  const source = normalizeSource(doc.source);
  return {
    id: toId(doc._id),
    name: String(doc.name || ""),
    phone: String(doc.phone || ""),
    category: String(doc.category || ""),
    message: String(doc.message || ""),
    source,
    sourceLabel: TICKET_SOURCE_LABELS[source],
    status: normalizeStatus(doc.status),
    userId: doc.userId ? String(doc.userId) : undefined,
    assignee: doc.assignee ? String(doc.assignee) : undefined,
    reply: doc.reply ? String(doc.reply) : undefined,
    lotType: doc.lotType ? String(doc.lotType) : undefined,
    lotCapacity: doc.lotCapacity ? String(doc.lotCapacity) : undefined,
    estimatedAnnualFee: doc.estimatedAnnualFee != null ? Number(doc.estimatedAnnualFee) : undefined,
    estimatedSalePrice: doc.estimatedSalePrice != null ? Number(doc.estimatedSalePrice) : undefined,
    createdAt: String(doc.createdAt),
    updatedAt: String(doc.updatedAt || doc.createdAt),
    repliedAt: doc.repliedAt ? String(doc.repliedAt) : undefined,
  };
}

function ticketFilter(q: string, status?: string) {
  const filter: Record<string, unknown> = {};
  if (status && status !== "all") filter.status = status;
  const term = q.trim();
  if (term) {
    const phone = normalizePhone(term);
    filter.$or = [
      { name: { $regex: term, $options: "i" } },
      { message: { $regex: term, $options: "i" } },
      { category: { $regex: term, $options: "i" } },
      { phone: phone || term },
      ...(phone ? [{ phone: { $regex: phone, $options: "i" } }] : []),
    ];
  }
  return filter;
}

declare global {
  var _ticketIndexesPromise: Promise<void> | undefined;
  var _ticketMigrationPromise: Promise<void> | undefined;
}

export async function ensureTicketIndexes(db: Db) {
  if (!global._ticketIndexesPromise) {
    global._ticketIndexesPromise = (async () => {
      await db.collection("tickets").createIndexes([
        { key: { createdAt: -1 }, name: "tickets_createdAt" },
        { key: { status: 1, createdAt: -1 }, name: "tickets_status_createdAt" },
        { key: { phone: 1, createdAt: -1 }, name: "tickets_phone_createdAt" },
        { key: { userId: 1, createdAt: -1 }, name: "tickets_userId_createdAt", sparse: true },
        { key: { legacyKind: 1, legacyId: 1 }, name: "tickets_legacy", sparse: true },
      ]);
    })().catch((error) => {
      global._ticketIndexesPromise = undefined;
      throw error;
    });
  }
  await global._ticketIndexesPromise;
}

export async function migrateLegacyTickets(db: Db) {
  if (!global._ticketMigrationPromise) {
    global._ticketMigrationPromise = (async () => {
      const meta = await db.collection("meta").findOne({ key: META_MIGRATION_KEY });
      if (meta?.done) return;

      const consults = await db.collection("consults").find().toArray();
      for (const item of consults) {
        const legacyId = toId(item._id);
        await db.collection("tickets").updateOne(
          { legacyKind: "consult", legacyId },
          {
            $setOnInsert: {
              name: String(item.name || ""),
              phone: normalizePhone(String(item.phone || "")) || String(item.phone || ""),
              category: String(item.lotType || "상담"),
              message: String(item.message || ""),
              source: normalizeSource(item.source || "consult"),
              status: normalizeStatus(item.status),
              userId: item.userId ? String(item.userId) : undefined,
              assignee: item.assignee ? String(item.assignee) : undefined,
              reply: item.reply ? String(item.reply) : undefined,
              legacyKind: "consult",
              legacyId,
              createdAt: item.createdAt ? new Date(String(item.createdAt)) : new Date(),
              updatedAt: item.updatedAt ? new Date(String(item.updatedAt)) : new Date(),
              repliedAt: item.repliedAt ? new Date(String(item.repliedAt)) : undefined,
            },
          },
          { upsert: true },
        );
      }

      const inquiries = await db.collection("inquiries").find().toArray();
      for (const item of inquiries) {
        const legacyId = toId(item._id);
        await db.collection("tickets").updateOne(
          { legacyKind: "inquiry", legacyId },
          {
            $setOnInsert: {
              name: String(item.name || ""),
              phone: normalizePhone(String(item.phone || "")) || String(item.phone || ""),
              category: String(item.category || "문의"),
              message: String(item.message || ""),
              source: normalizeSource(item.source || "inquiry"),
              status: normalizeStatus(item.status),
              userId: item.userId ? String(item.userId) : undefined,
              assignee: item.assignee ? String(item.assignee) : undefined,
              reply: item.reply ? String(item.reply) : undefined,
              legacyKind: "inquiry",
              legacyId,
              createdAt: item.createdAt ? new Date(String(item.createdAt)) : new Date(),
              updatedAt: item.updatedAt ? new Date(String(item.updatedAt)) : new Date(),
              repliedAt: item.repliedAt ? new Date(String(item.repliedAt)) : undefined,
            },
          },
          { upsert: true },
        );
      }

      await db.collection("meta").updateOne(
        { key: META_MIGRATION_KEY },
        { $set: { key: META_MIGRATION_KEY, done: true, migratedAt: new Date() } },
        { upsert: true },
      );
    })().catch((error) => {
      global._ticketMigrationPromise = undefined;
      console.error("[tickets] legacy migration failed:", error);
    });
  }
  await global._ticketMigrationPromise;
}

async function ticketsReady() {
  const db = await getDb();
  await ensureTicketIndexes(db);
  await migrateLegacyTickets(db);
  return db;
}

export async function createTicket(input: TicketInput) {
  const db = await ticketsReady();
  const now = new Date();
  const doc = {
    name: input.name.trim(),
    phone: normalizePhone(input.phone) || input.phone.trim(),
    category: input.category.trim(),
    message: input.message.trim(),
    source: normalizeSource(input.source || "consult"),
    status: "pending" as TicketStatus,
    userId: input.userId,
    lotType: input.lotType?.trim() || undefined,
    lotCapacity: input.lotCapacity?.trim() || undefined,
    estimatedAnnualFee: input.estimatedAnnualFee != null ? Number(input.estimatedAnnualFee) : undefined,
    estimatedSalePrice: input.estimatedSalePrice != null ? Number(input.estimatedSalePrice) : undefined,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection("tickets").insertOne(doc);
  return toId(result.insertedId);
}

export async function listTicketsAdmin(options: {
  page?: number;
  q?: string;
  status?: string;
  pageSize?: number;
}) {
  const db = await ticketsReady();
  const pageSize = options.pageSize || TICKET_PAGE_SIZE;
  const page = Math.max(1, options.page || 1);
  const filter = ticketFilter(options.q || "", options.status);
  const col = db.collection("tickets");

  const [total, docs] = await Promise.all([
    col.countDocuments(filter),
    col
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
  ]);

  return {
    rows: docs.map(mapTicket),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listTicketsForMember(options: { userId?: string; phone?: string; limit?: number }) {
  const db = await ticketsReady();
  const limit = options.limit || 20;
  const clauses: Record<string, unknown>[] = [];
  if (options.userId) clauses.push({ userId: options.userId });
  if (options.phone) {
    const phone = normalizePhone(options.phone) || options.phone;
    clauses.push({ phone });
  }
  if (!clauses.length) return [];

  const filter = clauses.length === 1 ? clauses[0] : { $or: clauses };
  const docs = await db.collection("tickets").find(filter).sort({ createdAt: -1 }).limit(limit).toArray();
  return docs.map(mapTicket);
}

export async function getTicket(id: string) {
  const db = await ticketsReady();
  const doc = await db.collection("tickets").findOne({ _id: oid(id) });
  return doc ? mapTicket(doc) : null;
}

export async function updateTicketStatus(id: string, status: TicketStatus, assignee?: string) {
  const db = await ticketsReady();
  await db.collection("tickets").updateOne(
    { _id: oid(id) },
    {
      $set: {
        status,
        assignee: assignee || undefined,
        updatedAt: new Date(),
      },
    },
  );
}

export async function replyTicket(id: string, reply: string, assignee?: string) {
  const db = await ticketsReady();
  const now = new Date();
  await db.collection("tickets").updateOne(
    { _id: oid(id) },
    {
      $set: {
        reply: reply.trim(),
        status: "done" as TicketStatus,
        assignee: assignee || undefined,
        repliedAt: now,
        updatedAt: now,
      },
    },
  );
}

export async function deleteTicket(id: string) {
  const db = await ticketsReady();
  await db.collection("tickets").deleteOne({ _id: oid(id) });
}

export async function countPendingTickets() {
  const db = await ticketsReady();
  return db.collection("tickets").countDocuments({ status: { $ne: "done" } });
}
