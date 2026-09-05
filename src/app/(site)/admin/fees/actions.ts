"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { guardAdminPage } from "../../../../lib/auth";
import {
  createMemberCharge,
  deleteMemberCharge,
  listMemberCharges,
  syncMemberChargesFromLegacy,
  updateMemberCharge,
  type ChargeStatus,
  type ChargeType,
} from "../../../../lib/member-charges";
import { saveFeeRates, saveSaleRates, updateMember } from "../../../../lib/store";
import type { FeeRecord } from "../../../../lib/store";

function parseFeeHistory(formData: FormData): FeeRecord[] {
  const years = formData.getAll("feeYear").map(String);
  const amounts = formData.getAll("feeAmount").map((v) => Number(v));
  const paidFlags = formData.getAll("feePaid").map(String);
  const memos = formData.getAll("feeMemo").map(String);

  return years
    .map((year, i) => ({
      year: year.trim(),
      amount: amounts[i] || 0,
      paid: paidFlags[i] === "1",
      memo: (memos[i] || "").trim(),
    }))
    .filter((row) => row.year);
}

function revalidateFeePaths() {
  revalidatePath("/admin/fees");
  revalidatePath("/admin/fees/annual-rates");
  revalidatePath("/admin/fees/sale-rates");
  revalidatePath("/lots/fees");
  revalidatePath("/mypage");
}

export async function saveFeeRatesAction(formData: FormData) {
  await guardAdminPage("/admin/fees/annual-rates");
  const types = formData.getAll("feeType").map(String);
  const capacities = formData.getAll("feeCapacity").map(String);
  const amounts = formData.getAll("feeAmount").map((v) => Number(v));
  const rates = types.map((type, i) => ({
    type,
    capacity: capacities[i] || "",
    annualFee: amounts[i] || 0,
  }));
  await saveFeeRates(rates);
  revalidateFeePaths();
  redirect("/admin/fees/annual-rates?saved=1");
}

export async function saveSaleRatesAction(formData: FormData) {
  await guardAdminPage("/admin/fees/sale-rates");
  const types = formData.getAll("feeType").map(String);
  const capacities = formData.getAll("feeCapacity").map(String);
  const amounts = formData.getAll("saleAmount").map((v) => Number(v));
  const rates = types.map((type, i) => ({
    type,
    capacity: capacities[i] || "",
    annualFee: amounts[i] || 0,
  }));
  await saveSaleRates(rates);
  revalidateFeePaths();
  redirect("/admin/fees/sale-rates?saved=1");
}

export async function updateFeeAction(formData: FormData) {
  await guardAdminPage("/admin/fees");
  const id = String(formData.get("id"));
  await updateMember(id, {
    feeStatus: String(formData.get("feeStatus") || "미납"),
    annualFee: Number(formData.get("annualFee") || 0),
    salePrice: Number(formData.get("salePrice") || 0) || undefined,
    feeHistory: parseFeeHistory(formData),
  });
  await syncMemberChargesFromLegacy(id);
  revalidateFeePaths();
  redirect("/admin/fees?saved=1");
}

export async function loadChargesAction(memberId: string) {
  await guardAdminPage("/admin/fees");
  await syncMemberChargesFromLegacy(memberId);
  return listMemberCharges(memberId);
}

export async function addChargeAction(formData: FormData) {
  await guardAdminPage("/admin/fees");
  const memberId = String(formData.get("memberId"));
  await createMemberCharge({
    memberId,
    chargeType: String(formData.get("chargeType")) as ChargeType,
    title: String(formData.get("title") || ""),
    amount: Number(formData.get("amount") || 0),
    paidAmount: Number(formData.get("paidAmount") || 0),
    status: String(formData.get("status") || "pending") as ChargeStatus,
    periodYear: String(formData.get("periodYear") || ""),
    memo: String(formData.get("memo") || ""),
    source: "manual",
  });
  revalidatePath("/mypage");
}

export async function updateChargeAction(formData: FormData) {
  await guardAdminPage("/admin/fees");
  await updateMemberCharge(String(formData.get("id")), {
    chargeType: String(formData.get("chargeType")) as ChargeType,
    title: String(formData.get("title") || ""),
    amount: Number(formData.get("amount") || 0),
    paidAmount: Number(formData.get("paidAmount") || 0),
    status: String(formData.get("status") || "pending") as ChargeStatus,
    periodYear: String(formData.get("periodYear") || ""),
    memo: String(formData.get("memo") || ""),
  });
  revalidatePath("/mypage");
}

export async function deleteChargeAction(formData: FormData) {
  await guardAdminPage("/admin/fees");
  await deleteMemberCharge(String(formData.get("id")));
  revalidatePath("/mypage");
}

export async function syncChargesAction(formData: FormData) {
  await guardAdminPage("/admin/fees");
  await syncMemberChargesFromLegacy(String(formData.get("memberId")));
  revalidatePath("/mypage");
}
