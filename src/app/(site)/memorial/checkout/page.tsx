import { redirect } from "next/navigation";

/** 결제는 요금·플랜 페이지 모달로 통합 */
export default async function MemorialCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  redirect(plan ? `/memorial/plans?plan=${encodeURIComponent(plan)}` : "/memorial/plans");
}
