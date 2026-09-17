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
  const res = await fetch(url, { ...init, headers, body, redirect: "manual" });
  rememberCookies(jar, res);
  const html = await res.text();
  return { res, html, status: res.status };
}

async function login(jar: Map<string, string>) {
  const id = process.env.CEMETERY_SOURCE_ID?.trim() || "";
  const password = process.env.CEMETERY_SOURCE_PASSWORD ?? "";
  if (!id || !password) {
    return { ok: false as const, error: "원본 아이디 또는 비밀번호가 없습니다." };
  }
  await request(jar, "/login.do");
  const { html, status } = await request(jar, "/loginProc.do", {
    method: "POST",
    form: { cd_company: companyCode(), id, passwd: password },
  });
  const failed =
    status >= 400 ||
    /doNotLoginError\s*=\s*"true"/.test(html) ||
    /name=["']passwd["']/.test(html) ||
    (!html.includes("contractList.do") && !html.includes("moveUrl"));
  if (failed) return { ok: false as const, error: "원본 로그인에 실패했습니다." };
  return { ok: true as const };
}

async function pagedHtml(
  jar: Map<string, string>,
  path: string,
  base: Record<string, string>,
  pageSize: string,
) {
  const pages: string[] = [];
  let last = 1;
  let listed = 0;
  for (let pg = 1; pg <= last; pg++) {
    const { html, status } = await request(jar, path, {
      method: "POST",
      form: { ...base, pg: String(pg), ps: pageSize },
    });
    if (status >= 400) throw new Error(`source-${path}-${status}`);
    pages.push(html);
    if (pg === 1) {
      last = Math.max(1, lastPage(html));
      listed = listedTotal(html);
    }
  }
  return { pages, listed };
}

export async function pullCemeterySource(): Promise<SourceSyncResult> {
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
    const auth = await login(jar);
    if (!auth.ok) return { ...empty, error: auth.error };

    const user = process.env.CEMETERY_SOURCE_ID?.trim() || "";
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
    const contractsPull = await pagedHtml(jar, "/contractList.do", contractBase, "200");
    const contracts = contractsPull.pages.flatMap(parseContractRows);
    for (const row of contracts.slice(0, 20)) {
      if (!row.tombNo || !row.contractNo) continue;
      const { html, status } = await request(jar, "/contractDetailList.do", {
        method: "POST",
        form: {
          ...contractBase,
          pg: "1",
          ps: "23",
          no_tomb: row.tombNo,
          no_contract: row.contractNo,
        },
      });
      if (status < 400) row.extra = parseNamedInputs(html);
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
    const feesPull = await pagedHtml(jar, "/managementExpenseList.do", feeBase, "100");
    const fees = feesPull.pages.flatMap(parseFeeRows);

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
