"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../../lib/auth";
import { createEntry, updateMemorialJob } from "../../../../lib/memorial-store";
import { storeMemorialMedia } from "../../../../lib/memorial-media";

export async function updateJobAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  if (!id) return;
  const status = String(formData.get("status") || "requested") as "requested" | "in_progress" | "completed" | "rejected";
  const staffNote = String(formData.get("staffNote") || "");
  await updateMemorialJob(id, { status, staffNote });
  revalidatePath("/admin/memorial");
}

export async function publishVideoAction(formData: FormData) {
  const admin = await requireAdmin();
  const hallCode = String(formData.get("hallCode") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const jobId = String(formData.get("jobId") || "").trim();
  const file = formData.get("file");

  if (!hallCode || !title || !(file instanceof File) || file.size === 0) {
    redirect("/admin/memorial?error=required");
  }

  const stored = await storeMemorialMedia(file);
  const entryId = await createEntry({
    hallCode,
    type: "edited_video",
    title,
    body,
    mediaUrl: stored.url,
    mediaType: stored.mediaType === "video" ? "video" : "image",
    eventKind: "staff_edit",
    authorId: admin.id,
    authorName: admin.name,
    status: "published",
  });

  if (jobId) {
    await updateMemorialJob(jobId, { status: "completed", resultEntryId: entryId, staffNote: "편집 영상 게시 완료" });
  }

  revalidatePath("/admin/memorial");
  revalidatePath(`/memorial/${hallCode}`);
  redirect("/admin/memorial?published=1");
}
