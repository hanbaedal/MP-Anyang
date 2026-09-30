import type { BaseKind, CemeteryInfoCopy } from "./cemetery-parse";

export const BASE_TABS: { kind: BaseKind | "plot"; label: string; columns: string[] }[] = [
  { kind: "plot", label: "묘지정보", columns: ["묘지번호", "평수", "위치", "사용여부"] },
  { kind: "cost", label: "관리비기준", columns: ["고지번호", "고지일자", "적용일자", "고지금액", "비고"] },
  { kind: "stone", label: "석물코드", columns: ["석물코드", "석물명", "규격", "단위", "단가", "사용여부"] },
  { kind: "company", label: "회사정보", columns: ["코드", "상호", "대표자", "주소"] },
  { kind: "user", label: "사용자", columns: ["사용자ID", "사용자명", "등록일", "사용여부"] },
  { kind: "consult", label: "상담코드", columns: ["상담코드", "상담코드명", "사용여부"] },
];

export function plotValues(row: CemeteryInfoCopy) {
  return [row.tombNo, row.pyeong, row.location, row.inUse];
}
