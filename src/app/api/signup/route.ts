import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { createMember, phoneExists, usernameExists } from "../../../lib/store";
import type { Relation } from "../../../lib/store";

export async function POST(request: Request) {
  const form = await request.formData();
  const username = String(form.get("username") || "").trim();
  const password = String(form.get("password") || "");
  const password2 = String(form.get("password2") || "");
  const name = String(form.get("name") || "").trim();
  const phone = String(form.get("phone") || "");
  const email = String(form.get("email") || "").trim();

  if (!username || !password || !name || !phone) {
    return NextResponse.redirect(new URL("/signup?error=required", request.url));
  }
  if (password !== password2) {
    return NextResponse.redirect(new URL("/signup?error=pw", request.url));
  }
  if (password.length < 6) {
    return NextResponse.redirect(new URL("/signup?error=short", request.url));
  }
  if (await usernameExists(username)) {
    return NextResponse.redirect(new URL("/signup?error=id", request.url));
  }
  if (await phoneExists(phone)) {
    return NextResponse.redirect(new URL("/signup?error=phone", request.url));
  }

  const deceasedNames = form.getAll("deceasedName").map(String);
  const relations = form.getAll("relation").map(String);
  const plotNos = form.getAll("relPlotNo").map(String);
  const rels: Relation[] = deceasedNames
    .map((deceasedName, i) => ({
      deceasedName: deceasedName.trim(),
      relation: (relations[i] || "").trim(),
      plotNo: (plotNos[i] || "").trim(),
    }))
    .filter((row) => row.deceasedName || row.plotNo);

  await createMember({
    username,
    passwordHash: await hash(password, 12),
    name,
    phone,
    email,
    plotNo: String(form.get("plotNo") || "").trim(),
    address: String(form.get("address") || "").trim(),
    emergencyPhone: String(form.get("emergencyPhone") || "").trim(),
    carNumber: String(form.get("carNumber") || "").trim(),
    contractNo: String(form.get("contractNo") || "").trim(),
    registeredAt: String(form.get("registeredAt") || new Date().toISOString().slice(0, 10)),
    relations: rels,
    annualFee: Number(form.get("annualFee") || 0),
  });

  const url = new URL("/login", request.url);
  url.searchParams.set("signup", "1");
  url.searchParams.set("u", username);
  return NextResponse.redirect(url);
}
