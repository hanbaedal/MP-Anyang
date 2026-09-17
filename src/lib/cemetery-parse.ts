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

function rowCells(rowHtml: string) {
  return [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => stripTags(m[1]));
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
};

export function parseContractRows(html: string): ContractCopy[] {
  const rows: ContractCopy[] = [];
  for (const row of tableBodyRows(html)) {
    const cells = row.cells.length >= 7 ? row.cells.slice(1) : row.cells;
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
    };
  });
}

export type ReportCopy = {
  date: string;
  handledCount: number;
  claimMaterial: string;
  inboundMaterial: string;
  note: string;
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
    };
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
    const c = row.cells.length >= 5 ? row.cells.slice(1) : row.cells;
    if (!c[0]) continue;
    rows.push({
      tombNo: c[0] ?? "",
      pyeong: c[1] ?? "",
      location: c[2] ?? "",
      inUse: c[3] ?? "",
    });
  }
  return rows;
}

export function parseNamedInputs(html: string) {
  const out: Record<string, string> = {};
  for (const m of html.matchAll(/<input\b[^>]*>/gi)) {
    const tag = m[0];
    const name = tag.match(/\bname=["']([^"']+)["']/i)?.[1];
    const value = tag.match(/\bvalue=["']([^"']*)["']/i)?.[1] ?? "";
    if (name && !/pass|passwd|password/i.test(name)) out[name] = value;
  }
  return out;
}
