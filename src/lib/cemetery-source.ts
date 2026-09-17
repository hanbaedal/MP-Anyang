import {
  lastPage,
  listedTotal,
  parseCemeteryInfoRows,
  parseContractRows,
  parseFeeRows,
  parseNamedInputs,
  parseReceiptRows,
  parseReportRows,
  type CemeteryInfoCopy,
  type ContractCopy,
  type FeeCopy,
  type ReceiptCopy,
  type ReportCopy,
} from "./cemetery-parse";

const DEFAULT_URL = "http://1.255.226.45:88/Cemetery";

function sourceUrl() {
  return (process.env.CEMETERY_SOURCE_URL?.trim() || DEFAULT_URL).replace(/\/$/, "");
}

function companyCode() {
  return process.env.CEMETERY_SOURCE_COMPANY?.trim() || "002";
}

export type SourceSyncResult = {
  ok: boolean;
  error?: string;
  contracts: ContractCopy[];
  fees: FeeCopy[];
  receipts: ReceiptCopy[];
  reports: ReportCopy[];
  cemetery: CemeteryInfoCopy[];
  listedContractTotal: number;
};

function cookieHeader(jar: Map<string, string>) {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function rememberCookies(jar: Map<string, string>, res: Response) {
  const raw = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  const fallback = res.headers.get("set-cookie");
  const parts = raw.length ? raw : fallback ? [fallback] : [];
  for (const part of parts) {
    const pair = part.split(";")[0];
    const i = pair.indexOf("=");
    if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
  }
}

async function request(
  jar: Map<string, string>,
  path: string,
  init: RequestInit & { form?: Record<string, string> } = {},
) {
  const url = path.startsWith("http") ? path : `${sourceUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  headers.set("User-Agent", "AnyangBackup/1.0");
  if (jar.size) headers.set("Cookie", cookieHeader(jar));
  let body = init.body;
  if (init.form) {
    headers.set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    headers.set("X-Requested-With", "XMLHttpRequest");
    body = new URLSearchParams(init.form);
  }
  const res = await fetch(url, {
    ...init,
    headers,
    body,
    redirect: "manual",
    signal: AbortSignal.timeout(45_000),
  });
  rememberCookies(jar, res);
  const html = await res.text();
  return { res, html, status: res.status };
}

export type SourceLogin = { id: string; password: string };

export const SOURCE_LOGIN_MISSING =
  "Render에 CEMETERY_SOURCE_ID / CEMETERY_SOURCE_PASSWORD를 넣으세요.";

export function sourceEnvReady() {
  return Boolean(process.env.CEMETERY_SOURCE_ID?.trim() && (process.env.CEMETERY_SOURCE_PASSWORD ?? "").length > 0);
}

export function resolveSourceLogin(): SourceLogin | null {
  const id = process.env.CEMETERY_SOURCE_ID?.trim() || "";
  const password = process.env.CEMETERY_SOURCE_PASSWORD ?? "";
  if (!id || !password) return null;
  return { id, password };
}

async function login(jar: Map<string, string>, creds: SourceLogin) {
  await request(jar, "/login.do");
  const { html, status } = await request(jar, "/loginProc.do", {
    method: "POST",
    form: { cd_company: companyCode(), id: creds.id, passwd: creds.password },
  });
  const failed =
    status >= 400 ||
    /doNotLoginError\s*=\s*"true"/.test(html) ||
    /name=["']passwd["']/.test(html) ||
    (!html.includes("contractList.do") && !html.includes("moveUrl"));
  if (failed) return { ok: false as const, error: "원본 로그인에 실패했습니다." };
  const landing = await request(jar, "/contractList.do");
  if (/name=["']passwd["']/.test(landing.html)) {
    return { ok: false as const, error: "원본 로그인에 실패했습니다." };
  }
  return { ok: true as const };
}

const PAGE_BATCH = 5;

async function readPage(
  jar: Map<string, string>,
  path: string,
  form: Record<string, string>,
  skipErrors: boolean,
) {
  let lastStatus = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    const item = await request(jar, path, { method: "POST", form });
    lastStatus = item.status;
    if (item.status < 400) return item;
    await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }
  if (skipErrors) return { html: "", status: lastStatus };
  throw new Error(`source-${path}-${lastStatus}`);
}

async function pagedHtml(
  jar: Map<string, string>,
  path: string,
  base: Record<string, string>,
  pageSize: string,
  opts: { batch?: number; skipErrors?: boolean; onPage?: (done: number, total: number) => void } = {},
) {
  const batchSize = opts.batch ?? PAGE_BATCH;
  const skipErrors = opts.skipErrors ?? false;
  const first = await readPage(jar, path, { ...base, pg: "1", ps: pageSize }, skipErrors);
  const pages = first.html ? [first.html] : [];
  const last = first.html ? Math.max(1, lastPage(first.html)) : 1;
  const listed = first.html ? listedTotal(first.html) : 0;
  opts.onPage?.(pages.length, last);
  for (let start = 2; start <= last; start += batchSize) {
    const batch: number[] = [];
    for (let pg = start; pg <= Math.min(last, start + batchSize - 1); pg++) batch.push(pg);
    const results =
      skipErrors || batchSize === 1
        ? await (async () => {
            const out = [];
            for (const pg of batch) {
              out.push(await readPage(jar, path, { ...base, pg: String(pg), ps: pageSize }, skipErrors));
            }
            return out;
          })()
        : await Promise.all(
            batch.map((pg) => readPage(jar, path, { ...base, pg: String(pg), ps: pageSize }, skipErrors)),
          );
    for (const item of results) {
      if (item.html) pages.push(item.html);
    }
    opts.onPage?.(pages.length, last);
  }
  return { pages, listed };
}

function feeKey(row: FeeCopy) {
  return [row.tombNo, row.billedOn, row.period, row.status, row.billedAmount, row.paidAmount, row.balance].join("|");
}

async function pullFees(
  jar: Map<string, string>,
  feeBase: Record<string, string>,
  onYear?: (done: number, total: number) => void,
) {
  const seen = new Set<string>();
  const fees: FeeCopy[] = [];
  const year = new Date().getFullYear();
  const firstYear = 1978;
  const lastYear = year + 1;
  const totalYears = lastYear - firstYear + 1;
  let doneYears = 0;
  for (let y = firstYear; y <= lastYear; y++) {
    const pull = await pagedHtml(
      jar,
      "/managementExpenseList.do",
      {
        ...feeBase,
        srch_billing_from: `${y}0101`,
        srch_billing_to: `${y}1231`,
        srch_gubun: "",
      },
      "80",
      { batch: 1, skipErrors: true },
    );
    for (const row of pull.pages.flatMap(parseFeeRows)) {
      const key = feeKey(row);
      if (seen.has(key)) continue;
      seen.add(key);
      fees.push(row);
    }
    doneYears += 1;
    onYear?.(doneYears, totalYears);
  }
  return fees;
}

export async function pullCemeterySource(
  creds: SourceLogin,
  opts: { onPull?: (collection: "contracts" | "fees" | "receipts" | "reports" | "cemetery", done: number, total: number) => void } = {},
): Promise<SourceSyncResult> {
  const empty: SourceSyncResult = {
    ok: false,
    contracts: [],
    fees: [],
    receipts: [],
    reports: [],
    cemetery: [],
    listedContractTotal: 0,
  };
  try {
    const jar = new Map<string, string>();
    const auth = await login(jar, creds);
    if (!auth.ok) return { ...empty, error: auth.error };

    const user = creds.id;
    const company = companyCode();

    const contractBase = {
      pageNo: "contract",
      pg_sub: "1",
      ps_sub: "8",
      no_tomb: "nodata",
      no_contract: "nodata",
      callNumber: "",
      reverseRowNumber: "1",
      subRow: "1",
      srch_tomb: "",
      srch_user: "",
      srch_fam: "",
      srch_tel: "",
      srch_flag: "2",
      cd_company: company,
      id_user_s: user,
    };
    const contractsPull = await pagedHtml(jar, "/contractList.do", contractBase, "200", {
      onPage: (done, total) => opts.onPull?.("contracts", done, total),
    });
    const contracts = contractsPull.pages.flatMap(parseContractRows);
    const detailTargets = contracts.filter((row) => row.tombNo && row.contractNo).slice(0, 20);
    for (let i = 0; i < detailTargets.length; i += PAGE_BATCH) {
      const slice = detailTargets.slice(i, i + PAGE_BATCH);
      const details = await Promise.all(
        slice.map((row) =>
          request(jar, "/contractDetailList.do", {
            method: "POST",
            form: {
              ...contractBase,
              pg: "1",
              ps: "23",
              no_tomb: row.tombNo,
              no_contract: row.contractNo,
            },
          }),
        ),
      );
      details.forEach((item, index) => {
        if (item.status < 400) slice[index].extra = parseNamedInputs(item.html);
      });
    }

    const feeBase = {
      pageNo: "expense",
      pg_sub: "1",
      ps_sub: "8",
      no_contract: "nodata",
      nm_seq: "",
      nl_seq: "",
      reverseRowNumber: "1",
      subRow: "1",
      srch_billing_from: "",
      srch_billing_to: "",
      srch_gubun: "",
      cd_company: company,
      id_user_s: user,
    };
    const fees = await pullFees(jar, feeBase, (done, total) => opts.onPull?.("fees", done, total));

    const receiptsPull = await pagedHtml(
      jar,
      "/receipt.do",
      {
        pageNo: "receipt",
        no_contract: "nodata",
        reverseRowNumber: "1",
        subRow: "1",
        year: "",
        no_receipt: "",
        bill_type: "C",
        srch_billing_from: "",
        srch_billing_to: "",
        cd_company: company,
        id_user_s: user,
      },
      "100",
      { onPage: (done, total) => opts.onPull?.("receipts", done, total) },
    );
    const receipts = receiptsPull.pages.flatMap(parseReceiptRows);

    const reportsPull = await pagedHtml(
      jar,
      "/workReport.do",
      {
        pageNo: "workreport",
        pg_sub: "1",
        ps_sub: "8",
        select_dt_busilog: "",
        select_no_busilog: "",
        del_seq: "",
        reverseRowNumber: "1",
        subRow: "1",
        cd_company: company,
        id_user_s: user,
      },
      "23",
      { onPage: (done, total) => opts.onPull?.("reports", done, total) },
    );
    const reports = reportsPull.pages.flatMap(parseReportRows);

    const cemeteryPull = await pagedHtml(
      jar,
      "/cemeteryInfoList.do",
      {
        pageNo: "1",
        no_tomb: "",
        no_contract: "",
        seq: "",
        cd_seokmul: "",
        id_user: "",
        cd_consult: "",
        id_insert: user,
        div: "",
        selt_company: company,
        cd_company: company,
      },
      "200",
      { onPage: (done, total) => opts.onPull?.("cemetery", done, total) },
    );
    const cemetery = cemeteryPull.pages.flatMap(parseCemeteryInfoRows);

    return {
      ok: true,
      contracts,
      fees,
      receipts,
      reports,
      cemetery,
      listedContractTotal: contractsPull.listed || contracts.length,
    };
  } catch (err) {
    console.error("[cemetery-source] read failed");
    console.error(err);
    return { ...empty, error: "원본에서 자료를 읽지 못했습니다." };
  }
}
