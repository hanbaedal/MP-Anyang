import { NextResponse } from "next/server";
import { requireStaffApi } from "@/lib/manage-guard";
import { createAdmin, deleteAdmin, listStaff, publicStaff, updateStaff, validateAdminInput } from "@/lib/staff";
import { usernameTaken } from "@/lib/auth";

export async function GET() {
  const guard = await requireStaffApi(true);
  if (guard.error) return guard.error;
  const items = (await listStaff()).map(publicStaff);
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const guard = await requireStaffApi(true);
  if (guard.error) return guard.error;
  const body = (await request.json()) as {
    username?: string;
    password?: string;
    name?: string;
    title?: string;
    phone?: string;
    email?: string;
  };
  const error = validateAdminInput({ ...body, creating: true });
  if (error) return NextResponse.json({ ok: false, error }, { status: 400 });
  if (await usernameTaken(body.username!.trim())) {
    return NextResponse.json({ ok: false, error: "이미 있는 아이디입니다." }, { status: 400 });
  }
  const result = await createAdmin({
    username: body.username!,
    password: body.password!,
    name: body.name!,
    title: body.title,
    phone: body.phone,
    email: body.email,
  });
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ ok: true, staff: publicStaff(result.staff) });
}

export async function PATCH(request: Request) {
  const guard = await requireStaffApi(true);
  if (guard.error) return guard.error;
  const body = (await request.json()) as {
    id?: string;
    name?: string;
    title?: string;
    phone?: string;
    email?: string;
    password?: string;
  };
  if (!body.id) return NextResponse.json({ ok: false, error: "계정이 없습니다." }, { status: 400 });
  const error = validateAdminInput({
    username: "adminok",
    name: body.name,
    phone: body.phone,
    email: body.email,
    password: body.password,
    creating: false,
  });
  if (error && body.name) return NextResponse.json({ ok: false, error }, { status: 400 });
  const result = await updateStaff(body.id, body);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ ok: true, staff: publicStaff(result.staff) });
}

export async function DELETE(request: Request) {
  const guard = await requireStaffApi(true);
  if (guard.error) return guard.error;
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const result = await deleteAdmin(id);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
