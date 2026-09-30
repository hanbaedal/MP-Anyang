export function stripTags(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseMoney(raw: string) {
  const n = Number(String(raw).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function lastPage(html: string) {
  const nums = [...html.matchAll(/goPage\((\d+)\)/g)].map((m) => Number(m[1]));
  return nums.length ? Math.max(...nums) : 1;
}

export function listedTotal(html: string) {
  const m = html.match(/id="inputcount1"[^>]*value="([^"]*)"/i);
  const n = m ? Number(String(m[1]).replace(/[^\d]/g, "")) : 0;
  return Number.isFinite(n) ? n : 0;
}

function isJunkCell(cell: string) {
  const text = cell.trim();
  return !text || !/[0-9A-Za-z가-힣]/.test(text);
}

function rowCells(rowHtml: string) {
  const cells = [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => stripTags(m[1]));
  while (cells.length && isJunkCell(cells[0])) cells.shift();
  while (cells.length && isJunkCell(cells[cells.length - 1])) cells.pop();
  return cells;
}

export function tableBodyRows(html: string) {
  const cleaned = html.replace(/<!--[\s\S]*?-->/g, " ");
  const body = cleaned.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/i)?.[1] ?? cleaned;
  return [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((m) => {
      const htmlRow = m[0];
      const detail = htmlRow.match(/goDetail\('([^']*)'\s*,\s*'([^']*)'/);
      return {
        cells: rowCells(htmlRow),
        arg1: detail?.[1] ?? "",
        arg2: detail?.[2] ?? "",
      };
    })
    .filter((row) => row.cells.some((cell) => cell));
}

export type ContractCopy = {
  tombNo: string;
  contractNo: string;
  burialDate: string;
  userName: string;
  familyName: string;
  pyeong: string;
  address: string;
  extra?: Record<string, string>;
  moveKind?: string;
  phoneDigits?: string;
};

export function parseContractRows(html: string): ContractCopy[] {
  const rows: ContractCopy[] = [];
  for (const row of tableBodyRows(html)) {
    const cells = row.cells;
    const tombNo = cells[0] || row.arg1;
    const contractNo = row.arg2;
    if (!tombNo && !contractNo) continue;
    rows.push({
      tombNo,
      contractNo,
      burialDate: cells[1] ?? "",
      userName: cells[2] ?? "",
      familyName: cells[3] ?? "",
      pyeong: cells[4] ?? "",
      address: cells[5] ?? "",
    });
  }
  return rows;
}

export type FeeCopy = {
  billedOn: string;
  tombNo: string;
  userName: string;
  period: string;
  billedAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  status: string;
  ref: string;
};

export function parseFeeRows(html: string): FeeCopy[] {
  const rows: FeeCopy[] = [];
  for (const row of tableBodyRows(html)) {
    const c = row.cells;
    if (c.length < 6) continue;
    rows.push({
      billedOn: c[0] ?? "",
      tombNo: c[1] ?? "",
      userName: c[2] ?? "",
      period: c[3] ?? "",
      billedAmount: parseMoney(c[4] ?? ""),
      paidAmount: parseMoney(c[5] ?? ""),
      balance: parseMoney(c[6] ?? ""),
      dueDate: c[7] ?? "",
      status: c[8] ?? "",
      ref: row.arg2,
    });
  }
  return rows;
}

export type ReceiptCopy = {
  date: string;
  tombNo: string;
  deceased: string;
  serial: string;
  amount: number;
  summary: string;
  kind: string;
  staff: string;
  year?: string;
  receiptNo?: string;
  inputs?: Record<string, string>;
};

export function parseReceiptRows(html: string): ReceiptCopy[] {
  return tableBodyRows(html).map((row) => {
    const c = row.cells;
    return {
      date: c[0] ?? "",
      tombNo: c[1] ?? "",
      deceased: c[2] ?? "",
      serial: c[3] ?? "",
      amount: parseMoney(c[4] ?? ""),
      summary: c[5] ?? "",
      kind: c[6] ?? "",
      staff: c[7] ?? "",
      year: row.arg1,
      receiptNo: row.arg2,
    };
  });
}

export type ReportTask = { tombNo: string; progress: string; result: string };
export type ReportPlan = { tombNo: string; note: string };

export type ReportCopy = {
  date: string;
  handledCount: number;
  claimMaterial: string;
  inboundMaterial: string;
  note: string;
  attendance?: string;
  reportDate?: string;
  reportNo?: string;
  tasks?: ReportTask[];
  plans?: ReportPlan[];
};

export function parseReportRows(html: string): ReportCopy[] {
  return tableBodyRows(html).map((row) => {
    const c = row.cells;
    return {
      date: c[0] ?? "",
      handledCount: parseMoney(c[1] ?? ""),
      claimMaterial: c[2] ?? "",
      inboundMaterial: c[3] ?? "",
      note: c[4] ?? "",
      attendance: c[5] ?? "",
      reportDate: row.arg1,
      reportNo: row.arg2,
    };
  });
}

function inputValue(html: string, name: string) {
  const tag = html.match(new RegExp(`<(?:input|textarea)\\b[^>]*name=["']${name}["'][^>]*>`, "i"))?.[0] ?? "";
  const value = tag.match(/\bvalue=["']([^"']*)["']/i)?.[1];
  if (value !== undefined) return value;
  const area = html.match(new RegExp(`<textarea\\b[^>]*name=["']${name}["'][^>]*>([\\s\\S]*?)<\\/textarea>`, "i"));
  return area ? stripTags(area[1]) : "";
}

function selectedText(html: string, name: string) {
  const block = html.match(new RegExp(`<select\\b[^>]*name=["']${name}["'][\\s\\S]*?<\\/select>`, "i"))?.[0] ?? "";
  const chosen = block.match(/<option\b[^>]*\bselected\b[^>]*>([\s\S]*?)<\/option>/i);
  return chosen ? stripTags(chosen[1]) : "";
}

export function parseWorkReportDetail(html: string) {
  const tasks: ReportTask[] = [];
  const plans: ReportPlan[] = [];
  for (const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const chunk = row[1];
    if (/name=["']no_tomb["']/.test(chunk)) {
      const tombNo = inputValue(chunk, "no_tomb");
      const progress = inputValue(chunk, "work_note");
      const result = selectedText(chunk, "result");
      if (tombNo || progress || result) tasks.push({ tombNo, progress, result });
    }
    if (/name=["']pre_no_tomb["']/.test(chunk)) {
      const tombNo = inputValue(chunk, "pre_no_tomb");
      const note = inputValue(chunk, "pre_work_note");
      if (tombNo || note) plans.push({ tombNo, note });
    }
  }
  return {
    tasks,
    plans,
    claimMaterial: inputValue(html, "charge_mat"),
    inboundMaterial: inputValue(html, "ipgo_mat"),
    note: inputValue(html, "note"),
  };
}

export type BaseKind = "cost" | "stone" | "company" | "user" | "consult";

export type BaseItem = {
  kind: BaseKind;
  key: string;
  values: string[];
};

export function parseBaseRows(html: string, kind: BaseKind): BaseItem[] {
  const skip = kind === "user" ? new Set([1]) : new Set<number>();
  return tableBodyRows(html).map((row) => {
    const values = row.cells.filter((_, index) => !skip.has(index));
    return { kind, key: row.arg1 || values[0] || "", values };
  });
}

export type CemeteryInfoCopy = {
  tombNo: string;
  pyeong: string;
  location: string;
  inUse: string;
};

export function parseCemeteryInfoRows(html: string): CemeteryInfoCopy[] {
  const rows: CemeteryInfoCopy[] = [];
  for (const row of tableBodyRows(html)) {
    const c = row.cells;
    const tombNo = c[0] || row.arg1;
    if (!tombNo) continue;
    rows.push({
      tombNo,
      pyeong: c[1] ?? "",
      location: c[2] ?? "",
      inUse: c[3] ?? "",
    });
  }
  return rows;
}

export type ContractFileCopy = {
  tombNo: string;
  contractNo: string;
  fields: Record<string, string>;
  pairs: { label: string; value: string }[];
  checks: string[];
  tables: { headers: string[]; rows: string[][] }[];
  inputs: Record<string, string>;
};

export function parseNamedInputs(html: string) {
  const out: Record<string, string> = {};
  for (const m of html.matchAll(/<input\b[^>]*>/gi)) {
    const tag = m[0];
    const name = tag.match(/\bname=["']([^"']+)["']/i)?.[1];
    const value = tag.match(/\bvalue=["']([^"']*)["']/i)?.[1] ?? "";
    if (!name || /pass|passwd|password/i.test(name)) continue;
    if (/type=["'](?:checkbox|radio)["']/i.test(tag) && !/\bchecked\b/i.test(tag)) continue;
    out[name] = value;
  }
  for (const m of html.matchAll(/<textarea\b[^>]*name=["']([^"']+)["'][^>]*>([\s\S]*?)<\/textarea>/gi)) {
    if (!/pass|passwd|password/i.test(m[1])) out[m[1]] = stripTags(m[2]);
  }
  for (const m of html.matchAll(/<select\b[^>]*name=["']([^"']+)["'][^>]*>[\s\S]*?<\/select>/gi)) {
    if (/pass|passwd|password/i.test(m[1])) continue;
    const chosen = m[0].match(/<option\b[^>]*\bselected\b[^>]*>([\s\S]*?)<\/option>/i);
    const text = chosen ? stripTags(chosen[1]) : "";
    if (text && text !== "선택") out[m[1]] = text;
  }
  return out;
}

export type ParsedSheet = {
  labels: Record<string, string>;
  pairs: { label: string; value: string }[];
  checks: string[];
  tables: { headers: string[]; rows: string[][] }[];
  paths: string[];
};

function controlText(fragment: string) {
  const textarea = fragment.match(/<textarea\b[^>]*>([\s\S]*?)<\/textarea>/i);
  if (textarea) return stripTags(textarea[1]);
  const select = fragment.match(/<select\b[^>]*>[\s\S]*?<\/select>/i);
  if (select) {
    const block = select[0];
    const chosen =
      block.match(/<option\b[^>]*\bselected\b[^>]*>([\s\S]*?)<\/option>/i) ??
      [...block.matchAll(/<option\b[^>]*>([\s\S]*?)<\/option>/gi)].find((item) => {
        const text = stripTags(item[1]);
        return text && text !== "선택";
      });
    return chosen ? stripTags(chosen[1]) : "";
  }
  const input = fragment.match(/<input\b[^>]*>/i)?.[0];
  if (!input || /type=["'](?:checkbox|radio|button|submit|file|image)["']/i.test(input)) return "";
  return input.match(/\bvalue=["']([^"']*)["']/i)?.[1] ?? "";
}

export function parseContractSheet(html: string): ParsedSheet {
  const labels: Record<string, string> = {};
  const pairs: ParsedSheet["pairs"] = [];
  const checks: string[] = [];
  const cells = [...html.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) => m[1]);
  for (let i = 0; i < cells.length - 1; i++) {
    const label = stripTags(cells[i]).replace(/[*:：]/g, "").trim();
    if (!label || label.length > 16 || /\d{2,}/.test(label)) continue;
    const value = controlText(cells[i + 1]) || "";
    if (!value || value === "선택") continue;
    pairs.push({ label, value });
    if (!labels[label]) labels[label] = value;
  }
  for (const m of html.matchAll(/<input\b[^>]*type=["']checkbox["'][^>]*>/gi)) {
    if (!/\bchecked\b/i.test(m[0])) continue;
    const after = html.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 24);
    const label = stripTags(after).split(/\s+/).find(Boolean) ?? "";
    if (label && label.length <= 8) checks.push(label);
  }
  const tables: ParsedSheet["tables"] = [];
  for (const table of html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)) {
    const headers = [...table[0].matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map((m) => stripTags(m[1])).filter(Boolean);
    const body = table[0].match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/i)?.[1] ?? table[0];
    const rows = [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
      .map((row) => [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => stripTags(cell[1])))
      .filter((row) => row.some(Boolean));
    if (headers.length >= 2 && rows.length) tables.push({ headers, rows });
  }
  const paths = new Set<string>();
  for (const m of html.matchAll(/["']([A-Za-z0-9_./-]+\.do)(?:\?[^"']*)?["']/g)) {
    const name = m[1].split("/").pop() ?? "";
    if (!name || /login|logout|main|contractList/i.test(name)) continue;
    if (/contract|user|fam|expense|consult|stone|tomb|grave|position|location/i.test(name)) {
      paths.add(name.startsWith("/") ? name : `/${name}`);
    }
  }
  return { labels, pairs, checks, tables, paths: [...paths].slice(0, 8) };
}
