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
  qty: number;
  parQty: number;
  inPrice: number;
  outPrice: number;
  note: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  orderedOn: string;
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

export type SaleLine = { item: string; spec: string; qty: string; unitPrice: string; amount: string };

export type Sale = {
  id: string;
  soldOn: string;
  serial: string;
  deceased: string;
  familyName: string;
  burial: string;
  tombNo: string;
  pyeong: string;
  amount: string;
  mgmtFrom: string;
  mgmtTo: string;
  mgmtAmount: string;
  sanFrom: string;
  sanTo: string;
  sanAmount: string;
  lines: SaleLine[];
  updatedAt: string;
};

const PARTNERS = "work_partners";
const PURCHASES = "work_purchases";
const INVENTORY = "work_inventory";
const ORDERS = "work_orders";
const SALES = "work_sales";

const files = {
  partners: dataFile("work-partners.local.json"),
  purchases: dataFile("work-purchases.local.json"),
  inventory: dataFile("work-inventory.local.json"),
  orders: dataFile("work-orders.local.json"),
  sales: dataFile("work-sales.local.json"),
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
  if (!name) throw new Error("품명을 입력해 주세요.");
  return {
    id: previous?.id ?? randomUUID(),
    name,
    spec: cleanText(input.spec),
    qty: cleanNumber(input.qty),
    parQty: cleanNumber(input.parQty),
    inPrice: cleanNumber(input.inPrice),
    outPrice: cleanNumber(input.outPrice),
    note: cleanText(input.note),
    updatedAt: nowIso(),
  };
}

function normalizeInventory(row: Partial<InventoryItem> & { id?: string; unitCost?: number }): InventoryItem {
  return {
    id: row.id || randomUUID(),
    name: cleanText(row.name),
    spec: cleanText(row.spec),
    qty: cleanNumber(row.qty),
    parQty: cleanNumber(row.parQty),
    inPrice: cleanNumber(row.inPrice ?? row.unitCost),
    outPrice: cleanNumber(row.outPrice),
    note: cleanText(row.note),
    updatedAt: row.updatedAt || nowIso(),
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
  const rows = (await readCollection<InventoryItem>(INVENTORY, files.inventory)).map((row) =>
    normalizeInventory(row as InventoryItem & { unitCost?: number }),
  );
  const key = stockKey(name, spec);
  const index = rows.findIndex((row) => stockKey(row.name, row.spec) === key);
  if (index < 0) {
    if (deltaQty < 0) return;
    rows.push({
      id: randomUUID(),
      name,
      spec: spec.trim(),
      qty: deltaQty,
      parQty: 0,
      inPrice: unitCost,
      outPrice: 0,
      note: "",
      updatedAt: nowIso(),
    });
  } else {
    const current = rows[index];
    rows[index] = {
      ...current,
      qty: current.qty + deltaQty,
      inPrice: unitCost || current.inPrice,
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
  return rows
    .map((row) => normalizeInventory(row as InventoryItem & { unitCost?: number }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko") || a.spec.localeCompare(b.spec, "ko"));
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

function datedDoc<T extends { id: string }>(
  input: {
    date: string;
    partnerId?: string;
    partnerName?: string;
    item?: string;
    spec?: string;
    qty?: unknown;
    unitPrice?: unknown;
    note?: string;
  },
  dateKey: "purchasedOn" | "orderedOn",
  dateLabel: string,
  previous?: T & { id: string },
) {
  const item = cleanText(input.item);
  if (!item) throw new Error("품목을 입력해 주세요.");
  const on = cleanText(input.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(on)) throw new Error(`${dateLabel}을 선택해 주세요.`);
  const qty = cleanNumber(input.qty);
  const unitPrice = cleanNumber(input.unitPrice);
  return {
    id: previous?.id ?? randomUUID(),
    [dateKey]: on,
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

export async function listOrders() {
  const rows = await readCollection<Order>(ORDERS, files.orders);
  return rows.sort((a, b) => b.orderedOn.localeCompare(a.orderedOn) || b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveOrder(input: Partial<Order>, id?: string) {
  const rows = await listOrders();
  const index = id ? rows.findIndex((row) => row.id === id) : -1;
  if (id && index < 0) throw new Error("주문을 찾지 못했습니다.");
  const next = datedDoc(
    { ...input, date: input.orderedOn ?? "" },
    "orderedOn",
    "주문일",
    index >= 0 ? rows[index] : undefined,
  ) as Order;
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  await writeCollection(ORDERS, files.orders, rows);
  return next;
}

export async function deleteOrder(id: string) {
  const rows = await listOrders();
  const next = rows.filter((row) => row.id !== id);
  if (next.length === rows.length) throw new Error("주문을 찾지 못했습니다.");
  await writeCollection(ORDERS, files.orders, next);
}

function lineQty(line: SaleLine) {
  const n = Number(String(line.qty ?? "").replaceAll(",", "").trim());
  return Number.isFinite(n) ? n : 0;
}

async function applySaleLines(lines: SaleLine[], sign: number) {
  for (const line of lines) {
    await applyStock(line.item, line.spec, sign * lineQty(line), 0);
  }
}

export function saleFromInput(input: Partial<Sale>, previous?: Sale): Sale {
  const soldOn = cleanText(input.soldOn);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(soldOn)) throw new Error("거래년월일을 선택해 주세요.");
  const lines = Array.isArray(input.lines)
    ? input.lines.slice(0, 6).map((line) => ({
        item: cleanText(line?.item),
        spec: cleanText(line?.spec),
        qty: cleanText(line?.qty),
        unitPrice: cleanText(line?.unitPrice),
        amount: cleanText(line?.amount),
      }))
    : [];
  while (lines.length < 6) lines.push({ item: "", spec: "", qty: "", unitPrice: "", amount: "" });
  return {
    id: previous?.id ?? randomUUID(),
    soldOn,
    serial: cleanText(input.serial),
    deceased: cleanText(input.deceased),
    familyName: cleanText(input.familyName),
    burial: cleanText(input.burial),
    tombNo: cleanText(input.tombNo),
    pyeong: cleanText(input.pyeong),
    amount: cleanText(input.amount),
    mgmtFrom: cleanText(input.mgmtFrom),
    mgmtTo: cleanText(input.mgmtTo),
    mgmtAmount: cleanText(input.mgmtAmount),
    sanFrom: cleanText(input.sanFrom),
    sanTo: cleanText(input.sanTo),
    sanAmount: cleanText(input.sanAmount),
    lines,
    updatedAt: nowIso(),
  };
}

export async function listSales() {
  const rows = await readCollection<Sale>(SALES, files.sales);
  return rows.sort((a, b) => b.soldOn.localeCompare(a.soldOn) || b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveSale(input: Partial<Sale>, id?: string) {
  const rows = await listSales();
  const index = id ? rows.findIndex((row) => row.id === id) : -1;
  if (id && index < 0) throw new Error("매출을 찾지 못했습니다.");
  const previous = index >= 0 ? rows[index] : undefined;
  const next = saleFromInput(input, previous);
  if (previous) await applySaleLines(previous.lines, 1);
  await applySaleLines(next.lines, -1);
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  await writeCollection(SALES, files.sales, rows);
  return next;
}

export async function deleteSale(id: string) {
  const rows = await listSales();
  const current = rows.find((row) => row.id === id);
  if (!current) throw new Error("매출을 찾지 못했습니다.");
  await applySaleLines(current.lines, 1);
  await writeCollection(
    SALES,
    files.sales,
    rows.filter((row) => row.id !== id),
  );
}
