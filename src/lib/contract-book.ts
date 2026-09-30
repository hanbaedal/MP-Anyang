import type { ContractCopy, ContractFileCopy, FeeCopy, ParsedSheet, ReceiptCopy } from "./cemetery-parse";

export type ContractHit = {
  key: string;
  tombNo: string;
  contractNo: string;
  burialDate: string;
  userName: string;
  familyName: string;
  pyeong: string;
  address: string;
};

export type GridRow = string[];

export type ContractBook = {
  key: string;
  contractNo: string;
  location: string;
  tombTypes: string[];
  tombNo: string;
  pyeong: string;
  areaM2: string;
  areaNote: string;
  total: string;
  deposit: string;
  balancePay: string;
  contractDate: string;
  balanceDate: string;
  useFee: string;
  burialMethod: string;
  burialKind: string;
  graveSetup: string;
  extraBurial: string;
  moveKind: string;
  moveDate: string;
  billUnit: string;
  manageKind: string;
  contractorName: string;
  contractorIdNo: string;
  phone: string;
  zip: string;
  address: string;
  addressDetail: string;
  note: string;
  userName: string;
  userIdNo: string;
  gender: string;
  deathDate: string;
  deathPlace: string;
  deathCause: string;
  burialDate: string;
  familyName: string;
  familyIdNo: string;
  familyGender: string;
  relation: string;
  familyZip: string;
  familyAddress: string;
  familyAddressDetail: string;
  familyPhone: string;
  familyMobile: string;
  users: GridRow[];
  families: GridRow[];
  bills: GridRow[];
  payments: GridRow[];
  consults: GridRow[];
  stones: GridRow[];
  latitude: string;
  longitude: string;
  fromSource: boolean;
};

export function contractKey(row: { tombNo: string; contractNo: string }) {
  return `${row.tombNo}::${row.contractNo}`;
}

export function toContractHit(row: ContractCopy): ContractHit {
  return {
    key: contractKey(row),
    tombNo: row.tombNo,
    contractNo: row.contractNo,
    burialDate: row.burialDate,
    userName: row.userName,
    familyName: row.familyName,
    pyeong: row.pyeong,
    address: row.address,
  };
}

function poolOf(sheet: ParsedSheet | null) {
  const pool = new Map<string, string[]>();
  for (const pair of sheet?.pairs ?? []) {
    const value = pair.value.trim();
    if (!value || value === "--" || value === "-") continue;
    const list = pool.get(pair.label) ?? [];
    list.push(value);
    pool.set(pair.label, list);
  }
  return pool;
}

function taker(pool: Map<string, string[]>) {
  return (...names: string[]) => {
    for (const name of names) {
      const list = pool.get(name);
      const value = list?.shift();
      if (value) return value;
    }
    return "";
  };
}

function areaFromPyeong(pyeong: string) {
  const n = Number(String(pyeong).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return "";
  return String(Math.round(n * 3.3 * 10) / 10);
}

function tableWith(tables: ParsedSheet["tables"], needle: string) {
  return tables.find((table) => table.headers.some((header) => header.includes(needle)));
}

function money(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export function buildContractBook(
  row: ContractCopy,
  fees: FeeCopy[],
  receipts: ReceiptCopy[],
  sheet: ParsedSheet | null,
): ContractBook {
  const take = taker(poolOf(sheet));
  const pyeong = take("평수") || row.pyeong;
  const tombNo = take("묘지번호") || row.tombNo;
  const ownFees = fees.filter((fee) => fee.tombNo === tombNo || fee.tombNo.replace(/\s/g, "") === tombNo.replace(/\s/g, ""));
  const ownReceipts = receipts.filter((item) => item.tombNo === tombNo);
  const billTable = sheet ? tableWith(sheet.tables, "청구금액") : undefined;
  const payTable = sheet ? tableWith(sheet.tables, "납부금액") : undefined;
  const userTable = sheet ? tableWith(sheet.tables, "사용자명") : undefined;
  const familyTable = sheet ? tableWith(sheet.tables, "연고자명") : undefined;
  const consultTable = sheet ? tableWith(sheet.tables, "상담") : undefined;
  const stoneTable = sheet ? tableWith(sheet.tables, "석물") : undefined;
  return {
    key: contractKey(row),
    contractNo: take("계약번호") || row.contractNo,
    location: take("위치"),
    tombTypes: sheet?.checks ?? [],
    tombNo,
    pyeong,
    areaM2: take( "㎡", "m²", "면적") || areaFromPyeong(pyeong),
    areaNote: take( "비고"),
    total: take( "합계"),
    deposit: take( "계약금"),
    balancePay: take( "잔금"),
    contractDate: take( "계약일자"),
    balanceDate: take( "잔금일자"),
    useFee: take( "묘지사용료"),
    burialMethod: take( "매장방법"),
    burialKind: take( "매장종류"),
    graveSetup: take( "설묘구분"),
    extraBurial: take( "추가매장"),
    moveKind: take( "이장구분"),
    moveDate: take( "이장일자"),
    billUnit: take( "청구단위"),
    manageKind: take( "관리구분"),
    contractorName: take( "계약자명") || row.familyName,
    contractorIdNo: take( "주민번호"),
    phone: take( "연락처", "핸드폰"),
    zip: take( "우편번호"),
    address: take( "주소") || row.address,
    addressDetail: take( "상세주소"),
    note: take( "비고"),
    userName: take( "사용자명") || row.userName,
    userIdNo: take( "주민번호"),
    gender: take( "성별"),
    deathDate: take( "사망일자"),
    deathPlace: take( "사망장소"),
    deathCause: take( "사인"),
    burialDate: take( "매장일자") || row.burialDate,
    familyName: take( "연고자명") || row.familyName,
    familyIdNo: take( "주민번호"),
    familyGender: take( "성별"),
    relation: take( "관계"),
    familyZip: take( "우편번호"),
    familyAddress: take( "주소") || row.address,
    familyAddressDetail: take( "상세주소"),
    familyPhone: take( "집전화", "자택번호"),
    familyMobile: take( "핸드폰", "연락처"),
    users: userTable?.rows ?? [],
    families: familyTable?.rows ?? [],
    bills:
      billTable?.rows ??
      ownFees.map((fee, index) => [
        String(index + 1),
        fee.userName,
        fee.billedOn,
        fee.period,
        money(fee.billedAmount),
        money(fee.paidAmount),
        money(fee.balance),
        fee.status,
      ]),
    payments:
      payTable?.rows ??
      ownReceipts.map((item, index) => [
        String(index + 1),
        item.date,
        item.deceased,
        money(item.amount),
        item.kind,
        item.staff,
      ]),
    consults: consultTable?.rows ?? [],
    stones: stoneTable?.rows ?? [],
    latitude: take( "위도"),
    longitude: take( "경도"),
    fromSource: Boolean(sheet && (sheet.pairs.length > 0 || Object.keys(sheet.labels).length > 0)),
  };
}

export function overlayContractInputs(
  book: ContractBook,
  inputs: Record<string, string> | undefined,
): ContractBook {
  if (!inputs) return book;
  const v = (...keys: string[]) => {
    for (const key of keys) {
      const value = inputs[key]?.trim();
      if (value && value !== "--") return value;
    }
    return "";
  };
  return {
    ...book,
    contractNo: book.contractNo || v("contractContract.no_contract"),
    location: book.location || v("contractCeme.place"),
    tombNo: book.tombNo || v("contractContract.no_tomb"),
    pyeong: book.pyeong || v("contractCeme.pyeong"),
    areaM2: book.areaM2 || v("squareMeter"),
    areaNote: book.areaNote || v("contractContract.rmks"),
    total: book.total,
    deposit: book.deposit || v("contractContract.amt_con"),
    balancePay: book.balancePay || v("contractContract.amt_jan"),
    contractDate: book.contractDate || v("contractContract.dt_con"),
    balanceDate: book.balanceDate || v("contractContract.dt_jan"),
    useFee: book.useFee || v("contractContract.amt_use"),
    burialMethod: book.burialMethod || v("contractContract.tp_burial"),
    burialKind: book.burialKind || v("contractContract.ca_burial"),
    graveSetup: book.graveSetup || v("contractContract.tp_sul"),
    extraBurial: book.extraBurial || v("contractContract.ex_burial"),
    moveKind: book.moveKind || v("contractContract.tp_mov"),
    moveDate: book.moveDate || v("contractContract.dt_mov"),
    billUnit: book.billUnit || v("contractContract.dt_term"),
    manageKind: book.manageKind || v("contractContract.cashrept_no"),
    contractorName: book.contractorName || v("contractContract.nm_con"),
    contractorIdNo: book.contractorIdNo || v("contractContract.jm_con"),
    phone: book.phone || v("contractContract.tel_con"),
    zip: book.zip || v("contractContract.zip_code_con"),
    address: book.address || v("contractContract.addr_con"),
    addressDetail: book.addressDetail || v("contractContract.addr1_con"),
    note: book.note || v("contractContract.remark"),
    userName: book.userName || v("contractDeath.nm_death"),
    userIdNo: book.userIdNo || v("contractDeath.jm_death"),
    gender: book.gender || v("contractDeath.s_death"),
    deathDate: book.deathDate || v("contractDeath.dt_death"),
    deathPlace: book.deathPlace || v("contractDeath.loc_death"),
    deathCause: book.deathCause || v("contractDeath.cause"),
    burialDate: book.burialDate || v("contractDeath.dt_burial"),
    latitude: book.latitude || v("latitude"),
    longitude: book.longitude || v("longitude"),
    familyName: book.familyName || v("contractFamily.nm_family"),
    familyIdNo: book.familyIdNo || v("contractFamily.jm_rel"),
    familyGender: book.familyGender || v("contractFamily.s_rel"),
    relation: book.relation || v("contractFamily.nm_relation"),
    familyZip: book.familyZip || v("contractFamily.zip_code"),
    familyAddress: book.familyAddress || v("contractFamily.addr"),
    familyAddressDetail: book.familyAddressDetail || v("contractFamily.addr1"),
    familyPhone: book.familyPhone || v("contractFamily.no_home"),
    familyMobile: book.familyMobile || v("contractFamily.no_hp"),
  };
}

const STORED_INPUTS: [keyof ContractBook, string][] = [
  ["contractNo", "contractContract.no_contract"],
  ["location", "contractCeme.place"],
  ["tombNo", "contractContract.no_tomb"],
  ["pyeong", "contractCeme.pyeong"],
  ["areaM2", "squareMeter"],
  ["areaNote", "contractContract.rmks"],
  ["deposit", "contractContract.amt_con"],
  ["contractDate", "contractContract.dt_con"],
  ["balancePay", "contractContract.amt_jan"],
  ["balanceDate", "contractContract.dt_jan"],
  ["useFee", "contractContract.amt_use"],
  ["burialMethod", "contractContract.tp_burial"],
  ["burialKind", "contractContract.ca_burial"],
  ["graveSetup", "contractContract.tp_sul"],
  ["extraBurial", "contractContract.ex_burial"],
  ["moveKind", "contractContract.tp_mov"],
  ["moveDate", "contractContract.dt_mov"],
  ["billUnit", "contractContract.dt_term"],
  ["manageKind", "contractContract.cashrept_no"],
  ["contractorName", "contractContract.nm_con"],
  ["contractorIdNo", "contractContract.jm_con"],
  ["phone", "contractContract.tel_con"],
  ["zip", "contractContract.zip_code_con"],
  ["address", "contractContract.addr_con"],
  ["addressDetail", "contractContract.addr1_con"],
  ["note", "contractContract.remark"],
  ["userName", "contractDeath.nm_death"],
  ["userIdNo", "contractDeath.jm_death"],
  ["gender", "contractDeath.s_death"],
  ["deathDate", "contractDeath.dt_death"],
  ["deathPlace", "contractDeath.loc_death"],
  ["deathCause", "contractDeath.cause"],
  ["burialDate", "contractDeath.dt_burial"],
  ["familyName", "contractFamily.nm_family"],
  ["familyIdNo", "contractFamily.jm_rel"],
  ["familyGender", "contractFamily.s_rel"],
  ["relation", "contractFamily.nm_relation"],
  ["familyZip", "contractFamily.zip_code"],
  ["familyAddress", "contractFamily.addr"],
  ["familyAddressDetail", "contractFamily.addr1"],
  ["familyMobile", "contractFamily.no_hp"],
    ["familyPhone", "contractFamily.no_home"],
  ["latitude", "latitude"],
  ["longitude", "longitude"],
];

export function emptyContractBook(): ContractBook {
  return overlayContractInputs(
    buildContractBook(
      { tombNo: "", contractNo: "", burialDate: "", userName: "", familyName: "", pyeong: "", address: "" },
      [],
      [],
      null,
    ),
    {},
  );
}

export function bookToStored(book: ContractBook, previous: ContractFileCopy | null) {
  const inputs = { ...(previous?.inputs ?? {}) };
  for (const [field, key] of STORED_INPUTS) {
    const value = book[field];
    if (typeof value === "string") inputs[key] = value.trim();
  }
  const tombNo = book.tombNo.trim();
  const contractNo = book.contractNo.trim();
  const contract: ContractCopy = {
    tombNo,
    contractNo,
    burialDate: book.burialDate.trim(),
    userName: book.userName.trim(),
    familyName: book.familyName.trim(),
    pyeong: book.pyeong.trim(),
    address: (book.address || book.familyAddress).trim(),
  };
  const file: ContractFileCopy = {
    tombNo,
    contractNo,
    fields: previous?.fields ?? {},
    pairs: previous?.pairs ?? [],
    checks: book.tombTypes,
    tables: previous?.tables ?? [],
    inputs,
  };
  return { contract, file };
}
