import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../../lib/auth";
import { fileToDataUrl } from "../../../../lib/images";
import { createParkPhoto, deleteParkPhoto, getParkPhotos, toId } from "../../../../lib/store";
import { AdminParkClient } from "./AdminParkClient";

async function addParkPhotoAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const imageUrl = await fileToDataUrl(formData, "image", "park");
  const url = imageUrl || String(formData.get("imageUrl") || "");
  if (!url) redirect("/admin/park?error=image");
  await createParkPhoto({
    title: String(formData.get("title") || ""),
    imageUrl: url,
    season: String(formData.get("season") || ""),
  });
  revalidatePath("/admin/park");
  redirect("/admin/park");
}

async function removeParkPhotoAction(formData: FormData) {
  "use server";
  await requireAdmin();
  await deleteParkPhoto(String(formData.get("id")));
  revalidatePath("/admin/park");
  redirect("/admin/park");
}

export default async function AdminParkPage() {
  await requireAdmin();
  const photos = (await getParkPhotos()).map((p) => ({
    id: toId(p._id),
    title: String(p.title || ""),
    imageUrl: String(p.imageUrl || ""),
    season: String(p.season || ""),
  }));

  return (
    <AdminParkClient
      photos={photos}
      addParkPhotoAction={addParkPhotoAction}
      removeParkPhotoAction={removeParkPhotoAction}
    />
  );
}
