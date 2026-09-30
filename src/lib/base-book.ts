import type { BaseKind, CemeteryInfoCopy } from "./cemetery-parse";

export type BaseTab = {
  kind: BaseKind | "plot";
  label: string;
  columns: string[];
  search: string | null;
  searchAt: number;
};

export const BASE_TABS: BaseTab[] = [
  { kind: "plot", label: "묘지정보", columns: ["묘지번호", "평수", "위치", "사용여부"], search: "묘지번호", searchAt: 0 },
  { kind: "cost", label: "관리비기준", columns: ["고지번호", "고지일자", "적용일자", "고지금액", "비고"], search: "고지번호", searchAt: 0 },
  { kind: "stone", label: "석물코드", columns: ["석물코드", "석물명", "규격", "단위", "단가", "사용여부"], search: "석물명", searchAt: 1 },
  { kind: "company", label: "회사정보", columns: ["코드", "상호", "대표자", "주소"], search: null, searchAt: 0 },
  { kind: "user", label: "사용자", columns: ["사용자ID", "사용자명", "등록일", "사용여부"], search: "사용자명", searchAt: 1 },
  { kind: "consult", label: "상담코드", columns: ["상담코드", "상담코드명", "사용여부"], search: "상담코드명", searchAt: 1 },
];

export type BaseField = { label: string; name: string; wide?: boolean };

export const BASE_FORMS: Record<BaseTab["kind"], BaseField[]> = {
  plot: [
    { label: "묘지번호", name: "tombNo" },
    { label: "평수", name: "pyeong" },
    { label: "위치", name: "place", wide: true },
    { label: "위도", name: "latitude" },
    { label: "경도", name: "longitude" },
    { label: "사용여부", name: "yn" },
  ],
  cost: [
    { label: "고지번호", name: "managementCost.no_notice" },
    { label: "고지일자", name: "managementCost.dt_notice" },
    { label: "적용일자", name: "managementCost.dt_app" },
    { label: "고지금액", name: "managementCost.amt_notice" },
    { label: "비고", name: "managementCost.bigo", wide: true },
  ],
  stone: [
    { label: "석물코드", name: "stoneCode.cd_seokmul" },
    { label: "석물명", name: "stoneCode.nm_seokmul" },
    { label: "규격", name: "stoneCode.stnd_item" },
    { label: "단위", name: "stoneCode.unit_im" },
    { label: "단가", name: "stoneCode.um" },
    { label: "사용여부", name: "stoneCode.yn_use" },
  ],
  company: [
    { label: "코드", name: "code" },
    { label: "상호", name: "companyInfo.nm_company" },
    { label: "사업자번호", name: "companyInfo.busi_no" },
    { label: "대표자", name: "companyInfo.nm_rep" },
    { label: "전화번호", name: "companyInfo.tel" },
    { label: "담당자", name: "companyInfo.nm_admin" },
    { label: "팩스", name: "companyInfo.fax" },
    { label: "우편번호", name: "companyInfo.zip_code" },
    { label: "주소", name: "companyInfo.addr", wide: true },
    { label: "상세주소", name: "companyInfo.addr_1", wide: true },
    { label: "계좌1", name: "companyInfo.bank_1", wide: true },
    { label: "계좌2", name: "companyInfo.bank_2", wide: true },
    { label: "계좌3", name: "companyInfo.bank_3", wide: true },
    { label: "계좌4", name: "companyInfo.bank_4", wide: true },
    { label: "계약접두", name: "companyInfo.con_prefix" },
    { label: "사진", name: "사진" },
  ],
  user: [
    { label: "사용자ID", name: "userInfo.id_user" },
    { label: "사용자명", name: "userInfo.nm_user" },
    { label: "부서", name: "userInfo.nm_dep" },
    { label: "등록일", name: "joined" },
    { label: "비고", name: "userInfo.remark", wide: true },
    { label: "사용여부", name: "userInfo.yn_use" },
  ],
  consult: [
    { label: "상담코드", name: "code" },
    { label: "상담코드명", name: "councelCodeInfo.nm_consult" },
    { label: "사용여부", name: "councelCodeInfo.yn_use" },
  ],
};

export function plotValues(row: CemeteryInfoCopy) {
  return [row.tombNo, row.pyeong, row.location, row.inUse];
}

export function plotFields(row: CemeteryInfoCopy) {
  return {
    tombNo: row.tombNo,
    pyeong: row.pyeong,
    place: row.location,
    latitude: "",
    longitude: "",
    yn: row.inUse,
  };
}
