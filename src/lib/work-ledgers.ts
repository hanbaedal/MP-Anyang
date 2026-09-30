import { randomUUID } from "node:crypto";
import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import { getDb, hasMongo } from "./mongo";

export type PartnerKind = "매입" | "매출" | "공통";

export type Partner = {
  id: string;
  kind: PartnerKind;
  name: string;
  bizNo: string;
  representative: string;
  phone: string;
  address: string;
  note: string;
  updatedAt: string;
};

export type Purchase = {
  id: string;
  purchasedOn: string;
  partnerId: string;
  partnerName: string;
  item: string;
  spec: string;
  qty: number;
  unitPrice: number;
  amount: number;
  note: string;
  updatedAt: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  spec: string;
  unit: string;
  qty: number;
  unitCost: number;
  note: string;
  updatedAt: string;
};

const PARTNERS = "work_partners";
const PURCHASES = "work_purchases";
const INVENTORY = "work_inventory";

const files = {
  partners: dataFile("work-partners.local.json"),
  purchases: dataFile("work-purchases.local.json"),
  inventory: dataFile("work-inventory.local.json"),
};

function nowIso() {
  return new Date().toISOString();
}

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function cleanNumber(value: unknown) {
  const n = Number(String(value ?? "").replaceAll(",", "").trim());
  if (!Number.isFinite(n)) return 0;
  return n;
}

function stockKey(name: string, spec: string) {
  return `${name.trim()}\n${spec.trim()}`;
}

async function readCollection<T extends { id: string }>(name: string, file: string): Promise<T[]> {
  if (hasMongo()) {
    const db = await getDb();
    if (db) {
      const rows = await db.collection(name).find({}).toArray();
      return rows.map((row) => {
        const { _id: _ignored, ...rest } = row;
        return rest as T;
      });
    }
  }
  return readJsonFile<T[]>(file, []);
}

async function writeCollection<T extends { id: string }>(name: string, file: string, rows: T[]) {
  if (hasMongo()) {
    const db = await getDb();
    if (db) {
      const col = db.collection(name);
      const ids = rows.map((row) => row.id);
      await col.deleteMany(ids.length ? { id: { $nin: ids } } : {});
      if (rows.length) {
        await col.bulkWrite(
          rows.map((row) => ({
            replaceOne: { filter: { id: row.id }, replacement: row, upsert: true },
          })),
        );
      }
      return;
    }
  }
  await writeJsonFile(file, rows);
}

export function partnerFromInput(input: Partial<Partner>, previous?: Partner): Partner {
  const kind = input.kind === "매출" || input.kind === "공통" ? input.kind : "매입";
  const name = cleanText(input.name);
  if (!name) throw new Error("상호를 입력해 주세요.");
  return {
    id: previous?.id ?? randomUUID(),
    kind,
    name,
    bizNo: cleanText(input.bizNo),
    representative: cleanText(input.representative),
    phone: cleanText(input.phone),
    address: cleanText(input.address),
    note: cleanText(input.note),
    updatedAt: nowIso(),
  };
}

export function purchaseFromInput(input: Partial<Purchase>, previous?: Purchase): Purchase {
  const item = cleanText(input.item);
  if (!item) throw new Error("품목을 입력해 주세요.");
  const purchasedOn = cleanText(input.purchasedOn);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(purchasedOn)) throw new Error("매입일을 선택해 주세요.");
  const qty = cleanNumber(input.qty);
  const unitPrice = cleanNumber(input.unitPrice);
  return {
    id: previous?.id ?? randomUUID(),
    purchasedOn,
    partnerId: cleanText(input.partnerId),
    partnerName: cleanText(input.partnerName),
    item,
    spec: cleanText(input.spec),
    qty,
    unitPrice,
    amount: Math.round(qty * unitPrice),
    note: cleanText(input.note),
    updatedAt: nowIso(),
  };
}

export function inventoryFromInput(input: Partial<InventoryItem>, previous?: InventoryItem): InventoryItem {
  const name = cleanText(input.name);
  if (!name) throw new Error("품목명을 입력해 주세요.");
  return {
    id: previous?.id ?? randomUUID(),
    name,
    spec: cleanText(input.spec),
    unit: cleanText(input.unit) || "개",
    qty: cleanNumber(input.qty),
    unitCost: cleanNumber(input.unitCost),
    note: cleanText(input.note),
    updatedAt: nowIso(),
  };
}

export async function listPartners() {
  const rows = await readCollection<Partner>(PARTNERS, files.partners);
  return rows.sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export async function savePartner(input: Partial<Partner>, id?: string) {
  const rows = await listPartners();
  const index = id ? rows.findIndex((row) => row.id === id) : -1;
  if (id && index < 0) throw new Error("거래처를 찾지 못했습니다.");
  const next = partnerFromInput(input, index >= 0 ? rows[index] : undefined);
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  await writeCollection(PARTNERS, files.partners, rows);
  return next;
}

export async function deletePartner(id: string) {
  const rows = await listPartners();
  const next = rows.filter((row) => row.id !== id);
  if (next.length === rows.length) throw new Error("거래처를 찾지 못했습니다.");
  await writeCollection(PARTNERS, files.partners, next);
}

export async function listPurchases() {
  const rows = await readCollection<Purchase>(PURCHASES, files.purchases);
  return rows.sort((a, b) => b.purchasedOn.localeCompare(a.purchasedOn) || b.updatedAt.localeCompare(a.updatedAt));
}

async function applyStock(item: string, spec: string, deltaQty: number, unitCost: number) {
  const name = item.trim();
  if (!name || !deltaQty) return;
  const rows = await readCollection<InventoryItem>(INVENTORY, files.inventory);
  const key = stockKey(name, spec);
  const index = rows.findIndex((row) => stockKey(row.name, row.spec) === key);
  if (index < 0) {
    if (deltaQty < 0) return;
    rows.push({
      id: randomUUID(),
      name,
      spec: spec.trim(),
      unit: "개",
      qty: deltaQty,
      unitCost,
      note: "",
      updatedAt: nowIso(),
    });
  } else {
    const current = rows[index];
    rows[index] = {
      ...current,
      qty: current.qty + deltaQty,
      unitCost: unitCost || current.unitCost,
      updatedAt: nowIso(),
    };
  }
  await writeCollection(INVENTORY, files.inventory, rows);
}

export async function savePurchase(input: Partial<Purchase>, id?: string) {
  const rows = await listPurchases();
  const index = id ? rows.findIndex((row) => row.id === id) : -1;
  if (id && index < 0) throw new Error("매입 내역을 찾지 못했습니다.");
  const previous = index >= 0 ? rows[index] : undefined;
  const next = purchaseFromInput(input, previous);
  if (previous) await applyStock(previous.item, previous.spec, -previous.qty, previous.unitPrice);
  await applyStock(next.item, next.spec, next.qty, next.unitPrice);
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  await writeCollection(PURCHASES, files.purchases, rows);
  return next;
}

export async function deletePurchase(id: string) {
  const rows = await listPurchases();
  const current = rows.find((row) => row.id === id);
  if (!current) throw new Error("매입 내역을 찾지 못했습니다.");
  await applyStock(current.item, current.spec, -current.qty, current.unitPrice);
  await writeCollection(
    PURCHASES,
    files.purchases,
    rows.filter((row) => row.id !== id),
  );
}

export async function listInventory() {
  const rows = await readCollection<InventoryItem>(INVENTORY, files.inventory);
  return rows.sort((a, b) => a.name.localeCompare(b.name, "ko") || a.spec.localeCompare(b.spec, "ko"));
}

export async function saveInventory(input: Partial<InventoryItem>, id?: string) {
  const rows = await listInventory();
  const index = id ? rows.findIndex((row) => row.id === id) : -1;
  if (id && index < 0) throw new Error("재고를 찾지 못했습니다.");
  const next = inventoryFromInput(input, index >= 0 ? rows[index] : undefined);
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  await writeCollection(INVENTORY, files.inventory, rows);
  return next;
}

export async function deleteInventory(id: string) {
  const rows = await listInventory();
  const next = rows.filter((row) => row.id !== id);
  if (next.length === rows.length) throw new Error("재고를 찾지 못했습니다.");
  await writeCollection(INVENTORY, files.inventory, next);
}
