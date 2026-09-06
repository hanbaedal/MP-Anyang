import type { Relation } from "./store";

export type MemberProfileInitial = {
  name: string;
  phone: string;
  email: string;
  address: string;
  emergencyPhone: string;
  carNumber: string;
  contractNo: string;
  plotNo: string;
  registeredAt: string;
  annualFee: number;
  salePrice: number;
  relations: Relation[];
  smsConsent: boolean;
  marketingSmsConsent: boolean;
};

export function emptyMemberProfile(): MemberProfileInitial {
  return {
    name: "",
    phone: "",
    email: "",
    address: "",
    emergencyPhone: "",
    carNumber: "",
    contractNo: "",
    plotNo: "",
    registeredAt: new Date().toISOString().slice(0, 10),
    annualFee: 0,
    salePrice: 0,
    relations: [],
    smsConsent: false,
    marketingSmsConsent: false,
  };
}

/** 회원가입·OAuth 후 필수로 채워야 하는 항목 */
export function isMemberProfileComplete(doc: Record<string, unknown> | null | undefined) {
  if (!doc) return false;
  return Boolean(
    String(doc.name || "").trim() &&
      String(doc.phone || "").trim() &&
      String(doc.plotNo || "").trim(),
  );
}

export function memberProfileFromDoc(doc: Record<string, unknown>): MemberProfileInitial {
  const relations = ((doc.relations as Relation[] | undefined) || []).map((row) => ({
    deceasedName: String(row.deceasedName || ""),
    relation: String(row.relation || ""),
    plotNo: String(row.plotNo || ""),
  }));
  return {
    name: String(doc.name || ""),
    phone: String(doc.phone || ""),
    email: String(doc.email || ""),
    address: String(doc.address || ""),
    emergencyPhone: String(doc.emergencyPhone || ""),
    carNumber: String(doc.carNumber || ""),
    contractNo: String(doc.contractNo || ""),
    plotNo: String(doc.plotNo || ""),
    registeredAt: String(doc.registeredAt || new Date().toISOString().slice(0, 10)),
    annualFee: Number(doc.annualFee || 0),
    salePrice: Number(doc.salePrice || 0),
    relations,
    smsConsent: Boolean(doc.smsConsent),
    marketingSmsConsent: Boolean(doc.marketingSmsConsent),
  };
}
