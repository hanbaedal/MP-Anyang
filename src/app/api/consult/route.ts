import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { readSession } from "../../../lib/auth";
import { createTicket } from "../../../lib/tickets";

export async function POST(request: Request) {
  const formData = await request.formData();
  const user = await readSession();

  const lotType = String(formData.get("lotType") || "");
  const lotCapacity = String(formData.get("lotCapacity") || "").trim();
  const category = lotCapacity ? `${lotType} · ${lotCapacity}` : lotType;
  const annualRaw = String(formData.get("estimatedAnnualFee") || "");
  const saleRaw = String(formData.get("estimatedSalePrice") || "");

  await createTicket({
    name: String(formData.get("name") || ""),
    phone: String(formData.get("phone") || ""),
    category,
    message: String(formData.get("message") || ""),
    source: (String(formData.get("source") || "consult") as "consult" | "side-cta" | "memorial"),
    userId: user?.id,
    lotType,
    lotCapacity: lotCapacity || undefined,
    estimatedAnnualFee: annualRaw ? Number(annualRaw) : undefined,
    estimatedSalePrice: saleRaw ? Number(saleRaw) : undefined,
  });

  revalidatePath("/consult");
  revalidatePath("/admin/inquiries");
  redirect("/consult?ok=1");
}
