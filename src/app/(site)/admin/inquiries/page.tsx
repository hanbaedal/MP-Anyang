import { revalidatePath } from "next/cache";
import { guardAdminPage } from "../../../../lib/auth";
import {
  deleteTicket,
  listTicketsAdmin,
  replyTicket,
  updateTicketStatus,
  type TicketStatus,
} from "../../../../lib/tickets";
import { AdminInquiriesClient } from "./AdminInquiriesClient";

export const dynamic = "force-dynamic";

async function replyTicketAction(formData: FormData) {
  "use server";
  const admin = await guardAdminPage("/admin/inquiries");
  const id = String(formData.get("id") || "");
  const reply = String(formData.get("reply") || "").trim();
  if (!id || !reply) return;
  await replyTicket(id, reply, admin.name);
  revalidatePath("/admin/inquiries");
  revalidatePath("/support/inquiry");
}

async function statusTicketAction(formData: FormData) {
  "use server";
  const admin = await guardAdminPage("/admin/inquiries");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "pending") as TicketStatus;
  if (!id) return;
  await updateTicketStatus(id, status, admin.name);
  revalidatePath("/admin/inquiries");
}

async function removeTicketAction(formData: FormData) {
  "use server";
  await guardAdminPage("/admin/inquiries");
  const id = String(formData.get("id") || "");
  if (!id) return;
  await deleteTicket(id);
  revalidatePath("/admin/inquiries");
  revalidatePath("/support/inquiry");
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  await guardAdminPage("/admin/inquiries");
  const { page: pageRaw, q = "", status = "all" } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);

  const result = await listTicketsAdmin({ page, q, status });

  return (
    <article className="article admin-page">
      <p className="kicker">관리자</p>
      <h1>문의·상담 관리</h1>
      <p className="lead">
        상담신청·문의사항·빠른 상담 접수를 통합 관리합니다. 페이지당 50건씩 조회하며, 1만 5천 건 이상도 DB 인덱스로
        처리합니다.
      </p>
      <AdminInquiriesClient
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
        query={q}
        statusFilter={status}
        replyAction={replyTicketAction}
        statusAction={statusTicketAction}
        removeAction={removeTicketAction}
      />
    </article>
  );
}
