import { randomUUID } from "node:crypto";
import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import { getDb, hasMongo } from "./mongo";

export type PartnerKind = "매입" | "공통";

export type Partner = {
  id: string;
  kind: PartnerKind;
  name: string;
  bizNo: string;
  representative: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  updatedAt: string;
};

export type StockKind = "상품" | "부자재";

export type Purchase = {
  id: string;
  purchasedOn: string;
  partnerId: string;
  partnerName: string;
  stockKind: StockKind;
  itemId: string;
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
  stockKind: StockKind;
  itemId: string;
  item: string;
  spec: string;
  qty: number;
  unitPrice: number;
  amount: number;
  note: string;
  updatedAt: string;
};

export type Material = {
  id: string;
  name: string;
  spec: string;
  unit: string;
  inPrice: number;
  parQty: number;
  openingQty: number;
  qty: number;
  note: string;
  updatedAt: string;
};

export type ProductPart = { materialId: string; qty: number };

export type Product = {
  id: string;
  name: string;
  spec: string;
  outPrice: number;
  inPrice: number;
  parQty: number;
  openingQty: number;
  qty: number;
  note: string;
  parts: ProductPart[];
  updatedAt: string;
};

export type SaleStockUse = {
  productId: string;
  productQty: number;
  materials: { materialId: string; qty: number }[];
};

export type SaleLine = {
  item: string;
  spec: string;
  qty: string;
  unitPrice: string;
  amount: string;
  productId?: string;
  stockUse?: SaleStockUse;
};

export type StockView = {
  kind: StockKind;
  id: string;
  name: string;
  spec: string;
  qty: number;
  parQty: number;
  inPrice: number;
  outPrice: number;
  note: string;
};

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
const MATERIALS = "work_materials";
const PRODUCTS = "work_products";

const files = {
  partners: dataFile("work-partners.local.json"),
  purchases: dataFile("work-purchases.local.json"),
  inventory: dataFile("work-inventory.local.json"),
  orders: dataFile("work-orders.local.json"),
  sales: dataFile("work-sales.local.json"),
  materials: dataFile("work-materials.local.json"),
  products: dataFile("work-products.local.json"),
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
  const kind = input.kind === "공통" ? "공통" : "매입";
  const name = cleanText(input.name);
  if (!name) throw new Error("상호를 입력해 주세요.");
  return {
    id: previous?.id ?? randomUUID(),
    kind,
    name,
    bizNo: cleanText(input.bizNo),
    representative: cleanText(input.representative),
    phone: cleanText(input.phone),
    email: cleanText(input.email),
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
    stockKind: input.stockKind === "부자재" ? "부자재" : "상품",
    itemId: cleanText(input.itemId),
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
  return rows
    .map((row) => ({
      ...row,
      kind: (row.kind === "공통" ? "공통" : "매입") as PartnerKind,
      email: row.email ?? "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
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

async function applyPurchaseStock(row: Purchase, sign: number) {
  const delta = sign * row.qty;
  if (!row.item.trim() || !delta) return;
  if (row.stockKind === "부자재") {
    const rows = await listMaterials();
    const index = rows.findIndex((item) => item.id === row.itemId || (item.name === row.item && item.spec === row.spec));
    if (index < 0) {
      if (sign < 0) return;
      throw new Error("부자재를 등록에서 먼저 골라 주세요.");
    }
    const current = rows[index];
    rows[index] = {
      ...current,
      qty: current.qty + delta,
      inPrice: sign > 0 && row.unitPrice ? row.unitPrice : current.inPrice,
      updatedAt: nowIso(),
    };
    await writeCollection(MATERIALS, files.materials, rows);
    return;
  }
  const rows = await listProducts();
  const index = rows.findIndex((item) => item.id === row.itemId || (item.name === row.item && item.spec === row.spec));
  if (index < 0) {
    if (sign < 0) return;
    throw new Error("상품을 등록에서 먼저 골라 주세요.");
  }
  const current = rows[index];
  rows[index] = {
    ...current,
    qty: current.qty + delta,
    inPrice: sign > 0 && row.unitPrice ? row.unitPrice : current.inPrice,
    updatedAt: nowIso(),
  };
  await writeCollection(PRODUCTS, files.products, rows);
}

export async function savePurchase(input: Partial<Purchase>, id?: string) {
  const rows = await listPurchases();
  const index = id ? rows.findIndex((row) => row.id === id) : -1;
  if (id && index < 0) throw new Error("매입 내역을 찾지 못했습니다.");
  const previous = index >= 0 ? rows[index] : undefined;
  const next = purchaseFromInput(input, previous);
  if (previous) await applyPurchaseStock(previous, -1);
  await applyPurchaseStock(next, 1);
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  await writeCollection(PURCHASES, files.purchases, rows);
  return next;
}

export async function deletePurchase(id: string) {
  const rows = await listPurchases();
  const current = rows.find((row) => row.id === id);
  if (!current) throw new Error("매입 내역을 찾지 못했습니다.");
  await applyPurchaseStock(current, -1);
  await writeCollection(
    PURCHASES,
    files.purchases,
    rows.filter((row) => row.id !== id),
  );
}

const PART_SLOTS = 10;

function partsFromInput(input: ProductPart[] | undefined) {
  const parts: ProductPart[] = [];
  for (const row of (input ?? []).slice(0, PART_SLOTS)) {
    const materialId = cleanText(row?.materialId);
    const qty = cleanNumber(row?.qty);
    if (!materialId || qty <= 0) continue;
    parts.push({ materialId, qty });
  }
  return parts;
}

export async function listMaterials() {
  const rows = await readCollection<Material>(MATERIALS, files.materials);
  return rows.sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export async function saveMaterial(input: Partial<Material>, id?: string) {
  const rows = await listMaterials();
  const index = id ? rows.findIndex((row) => row.id === id) : -1;
  if (id && index < 0) throw new Error("부자재를 찾지 못했습니다.");
  const previous = index >= 0 ? rows[index] : undefined;
  const name = cleanText(input.name);
  if (!name) throw new Error("부자재 이름을 입력해 주세요.");
  const openingQty = cleanNumber(input.openingQty);
  const qty = previous ? previous.qty + (openingQty - previous.openingQty) : openingQty;
  const next: Material = {
    id: previous?.id ?? randomUUID(),
    name,
    spec: cleanText(input.spec),
    unit: cleanText(input.unit),
    inPrice: cleanNumber(input.inPrice),
    parQty: cleanNumber(input.parQty),
    openingQty,
    qty,
    note: cleanText(input.note),
    updatedAt: nowIso(),
  };
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  await writeCollection(MATERIALS, files.materials, rows);
  return next;
}

export async function deleteMaterial(id: string) {
  const products = await listProducts();
  if (products.some((row) => row.parts.some((part) => part.materialId === id))) {
    throw new Error("상품 구성에 들어 있는 부자재는 지울 수 없습니다.");
  }
  const rows = await listMaterials();
  const next = rows.filter((row) => row.id !== id);
  if (next.length === rows.length) throw new Error("부자재를 찾지 못했습니다.");
  await writeCollection(MATERIALS, files.materials, next);
}

export async function listProducts() {
  const rows = await readCollection<Product>(PRODUCTS, files.products);
  return rows
    .map((row) => ({ ...row, parts: partsFromInput(row.parts) }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export async function saveProduct(input: Partial<Product>, id?: string) {
  const rows = await listProducts();
  const index = id ? rows.findIndex((row) => row.id === id) : -1;
  if (id && index < 0) throw new Error("상품을 찾지 못했습니다.");
  const previous = index >= 0 ? rows[index] : undefined;
  const name = cleanText(input.name);
  if (!name) throw new Error("상품명을 입력해 주세요.");
  const openingQty = cleanNumber(input.openingQty);
  const qty = previous ? previous.qty + (openingQty - previous.openingQty) : openingQty;
  const next: Product = {
    id: previous?.id ?? randomUUID(),
    name,
    spec: cleanText(input.spec),
    outPrice: cleanNumber(input.outPrice),
    inPrice: cleanNumber(input.inPrice ?? previous?.inPrice),
    parQty: cleanNumber(input.parQty),
    openingQty,
    qty,
    note: cleanText(input.note),
    parts: partsFromInput(input.parts),
    updatedAt: nowIso(),
  };
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  await writeCollection(PRODUCTS, files.products, rows);
  return next;
}

export async function deleteProduct(id: string) {
  const rows = await listProducts();
  const next = rows.filter((row) => row.id !== id);
  if (next.length === rows.length) throw new Error("상품을 찾지 못했습니다.");
  await writeCollection(PRODUCTS, files.products, next);
}

export async function assembleProduct(id: string, count: number) {
  if (!(count > 0)) throw new Error("만들 수량을 입력해 주세요.");
  const products = await listProducts();
  const materials = await listMaterials();
  const product = products.find((row) => row.id === id);
  if (!product) throw new Error("상품을 찾지 못했습니다.");
  const parts = product.parts.filter((part) => part.materialId && part.qty > 0);
  if (!parts.length) throw new Error("조합할 부자재가 없습니다.");
  for (const part of parts) {
    const material = materials.find((row) => row.id === part.materialId);
    const need = part.qty * count;
    if (!material || material.qty < need) throw new Error(`${material?.name || "부자재"} 재고가 부족합니다.`);
  }
  for (const part of parts) {
    const material = materials.find((row) => row.id === part.materialId);
    if (!material) continue;
    material.qty -= part.qty * count;
    material.updatedAt = nowIso();
  }
  product.qty += count;
  product.updatedAt = nowIso();
  await writeCollection(MATERIALS, files.materials, materials);
  await writeCollection(PRODUCTS, files.products, products);
  return product;
}

export async function listInventory(): Promise<StockView[]> {
  const [products, materials] = await Promise.all([listProducts(), listMaterials()]);
  const goods: StockView[] = products.map((row) => ({
    kind: "상품",
    id: row.id,
    name: row.name,
    spec: row.spec,
    qty: row.qty,
    parQty: row.parQty,
    inPrice: row.inPrice,
    outPrice: row.outPrice,
    note: row.note,
  }));
  const parts: StockView[] = materials.map((row) => ({
    kind: "부자재",
    id: row.id,
    name: row.name,
    spec: row.spec,
    qty: row.qty,
    parQty: row.parQty,
    inPrice: row.inPrice,
    outPrice: 0,
    note: row.note,
  }));
  return [...goods, ...parts];
}

export async function saveInventory(_input: Partial<InventoryItem>, _id?: string): Promise<StockView> {
  throw new Error("재고 수량은 상품과 부자재 등록에서 바꿉니다.");
}

export async function deleteInventory(_id: string) {
  throw new Error("재고 수량은 상품과 부자재 등록에서 바꿉니다.");
}

function datedDoc<T extends { id: string }>(
  input: {
    date: string;
    partnerId?: string;
    partnerName?: string;
    stockKind?: StockKind;
    itemId?: string;
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
    stockKind: input.stockKind === "부자재" ? "부자재" : "상품",
    itemId: cleanText(input.itemId),
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

function findProduct(rows: Product[], line: SaleLine) {
  if (line.productId) {
    const hit = rows.find((row) => row.id === line.productId);
    if (hit) return hit;
  }
  const name = line.item.trim();
  return rows.find((row) => row.name === name && row.spec === line.spec.trim());
}

function applySaleLine(products: Product[], materials: Material[], line: SaleLine): SaleStockUse {
  const qty = lineQty(line);
  if (!line.item.trim() || qty <= 0) return { productId: "", productQty: 0, materials: [] };
  const product = findProduct(products, line);
  if (!product) throw new Error(`${line.item} 상품을 등록에서 먼저 골라 주세요.`);
  const fromProduct = Math.min(Math.max(0, product.qty), qty);
  const shortfall = qty - fromProduct;
  const used: { materialId: string; qty: number }[] = [];
  if (shortfall > 0) {
    const parts = product.parts.filter((part) => part.materialId && part.qty > 0);
    if (!parts.length) throw new Error(`${product.name} 재고가 부족합니다.`);
    for (const part of parts) {
      const need = part.qty * shortfall;
      const material = materials.find((row) => row.id === part.materialId);
      if (!material || material.qty < need) throw new Error(`${material?.name || "부자재"} 재고가 부족합니다.`);
      used.push({ materialId: part.materialId, qty: need });
    }
  }
  product.qty -= fromProduct;
  product.updatedAt = nowIso();
  for (const part of used) {
    const material = materials.find((row) => row.id === part.materialId);
    if (!material) continue;
    material.qty -= part.qty;
    material.updatedAt = nowIso();
  }
  return { productId: product.id, productQty: fromProduct, materials: used };
}

function restoreSaleLine(products: Product[], materials: Material[], line: SaleLine) {
  const use = line.stockUse;
  if (use?.productId) {
    const product = products.find((row) => row.id === use.productId);
    if (product) {
      product.qty += use.productQty;
      product.updatedAt = nowIso();
    }
    for (const part of use.materials) {
      const material = materials.find((row) => row.id === part.materialId);
      if (!material) continue;
      material.qty += part.qty;
      material.updatedAt = nowIso();
    }
    return;
  }
  const product = findProduct(products, line);
  if (!product) return;
  product.qty += lineQty(line);
  product.updatedAt = nowIso();
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
        productId: cleanText(line?.productId),
      }))
    : [];
  while (lines.length < 6) lines.push({ item: "", spec: "", qty: "", unitPrice: "", amount: "", productId: "" });
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
  const products = await listProducts();
  const materials = await listMaterials();
  if (previous) {
    for (const line of previous.lines) restoreSaleLine(products, materials, line);
  }
  next.lines = next.lines.map((line) => ({ ...line, stockUse: applySaleLine(products, materials, line) }));
  await writeCollection(PRODUCTS, files.products, products);
  await writeCollection(MATERIALS, files.materials, materials);
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  await writeCollection(SALES, files.sales, rows);
  return next;
}

export async function deleteSale(id: string) {
  const rows = await listSales();
  const current = rows.find((row) => row.id === id);
  if (!current) throw new Error("매출을 찾지 못했습니다.");
  const products = await listProducts();
  const materials = await listMaterials();
  for (const line of current.lines) restoreSaleLine(products, materials, line);
  await writeCollection(PRODUCTS, files.products, products);
  await writeCollection(MATERIALS, files.materials, materials);
  await writeCollection(
    SALES,
    files.sales,
    rows.filter((row) => row.id !== id),
  );
}
