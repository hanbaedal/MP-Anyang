/** PDF로 제공하는 공공서류 (홈페이지관리에서 등록) */
export const FUNERAL_DOC_IDS = ["death", "family", "police", "cremation"] as const;

export type FuneralDocId = (typeof FUNERAL_DOC_IDS)[number];

export type FuneralDocFile = {
  docId: FuneralDocId;
  filePath: string;
  fileName: string;
  updatedAt: string;
};

export const FUNERAL_DOC_META: Record<
  FuneralDocId,
  { i18n: string; manageLabel: string }
> = {
  death: { i18n: "fun.docDeath", manageLabel: "사망진단서 1부" },
  family: { i18n: "fun.docFamily", manageLabel: "고인 포함 가족관계증명서 또는 제적등본 1부" },
  police: { i18n: "fun.docPolice", manageLabel: "검사지위서 1부(사고사인 경우)" },
  cremation: { i18n: "fun.docCremation", manageLabel: "화장증명서 1부" },
};

export type FuneralDocRow =
  | { type: "download"; docId: FuneralDocId }
  | { type: "text"; i18n: "fun.docId" };

export const FUNERAL_BURIAL_ROWS: FuneralDocRow[] = [
  { type: "download", docId: "death" },
  { type: "download", docId: "family" },
  { type: "text", i18n: "fun.docId" },
  { type: "download", docId: "police" },
];

export const FUNERAL_CREMATION_ROWS: FuneralDocRow[] = [
  { type: "download", docId: "death" },
  { type: "download", docId: "cremation" },
  { type: "download", docId: "family" },
  { type: "download", docId: "police" },
];

export function isFuneralDocId(value: string): value is FuneralDocId {
  return FUNERAL_DOC_IDS.includes(value as FuneralDocId);
}
