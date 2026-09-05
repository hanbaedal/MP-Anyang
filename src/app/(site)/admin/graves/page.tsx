import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../../lib/auth";
import { filesToDataUrls, fileToDataUrl, imageStorageMode } from "../../../../lib/images";
import { createGrave, deleteGrave, getGraves, toId, updateGrave } from "../../../../lib/store";
import { AdminGravesClient } from "./AdminGravesClient";

async function addGraveAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const photos = await filesToDataUrls(formData, "photos");
  const mapImage = await fileToDataUrl(formData, "mapImage");
  await createGrave({
    plotNo: String(formData.get("plotNo") || ""),
    deceasedName: String(formData.get("deceasedName") || ""),
    familyName: String(formData.get("familyName") || ""),
    zone: String(formData.get("zone") || ""),
    type: String(formData.get("type") || ""),
    capacity: String(formData.get("capacity") || ""),
    annualFee: Number(formData.get("annualFee") || 0) || undefined,
    buriedAt: String(formData.get("buriedAt") || ""),
    mapNote: String(formData.get("mapNote") || ""),
    mapImage,
    photos,
    lastInspectedAt: String(formData.get("lastInspectedAt") || ""),
    inspectNote: String(formData.get("inspectNote") || ""),
  });
  revalidatePath("/admin/graves");
  redirect("/admin/graves");
}

async function editGraveAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const existing = (await getGraves()).find((g) => toId(g._id) === id);
  const newPhotos = await filesToDataUrls(formData, "photos");
  const mapImageFile = await fileToDataUrl(formData, "mapImage");
  const keepPhotos = formData.getAll("keepPhoto").map(String);
  const photos = [...keepPhotos, ...newPhotos].slice(0, 10);
  await updateGrave(id, {
    plotNo: String(formData.get("plotNo") || ""),
    deceasedName: String(formData.get("deceasedName") || ""),
    familyName: String(formData.get("familyName") || ""),
    zone: String(formData.get("zone") || ""),
    type: String(formData.get("type") || ""),
    capacity: String(formData.get("capacity") || ""),
    annualFee: Number(formData.get("annualFee") || 0) || undefined,
    buriedAt: String(formData.get("buriedAt") || ""),
    mapNote: String(formData.get("mapNote") || ""),
    mapImage: mapImageFile || String(existing?.mapImage || ""),
    photos,
    lastInspectedAt: String(formData.get("lastInspectedAt") || ""),
    inspectNote: String(formData.get("inspectNote") || ""),
  });
  revalidatePath("/admin/graves");
  redirect("/admin/graves");
}

async function removeGraveAction(formData: FormData) {
  "use server";
  await requireAdmin();
  await deleteGrave(String(formData.get("id")));
  revalidatePath("/admin/graves");
  redirect("/admin/graves");
}

export default async function AdminGravesPage() {
  await requireAdmin();
  const graves = (await getGraves()).map((g) => ({
    id: toId(g._id),
    plotNo: String(g.plotNo || ""),
    deceasedName: String(g.deceasedName || ""),
    familyName: String(g.familyName || ""),
    zone: String(g.zone || ""),
    type: String(g.type || ""),
    capacity: String(g.capacity || ""),
    annualFee: Number(g.annualFee || 0),
    buriedAt: String(g.buriedAt || ""),
    mapNote: String(g.mapNote || ""),
    mapImage: String(g.mapImage || ""),
    photos: ((g.photos as string[] | undefined) || []).filter(Boolean),
    lastInspectedAt: String(g.lastInspectedAt || ""),
    inspectNote: String(g.inspectNote || ""),
  }));

  return (
    <article className="article admin-members-page">
      <p className="kicker">관리자</p>
      <h1>묘역 관리</h1>
      <p className="lead">묘번순 목록 · 검색 · 등록/수정/삭제 · 사진·점검</p>

      <AdminGravesClient
        graves={graves}
        imageStorage={imageStorageMode()}
        addGraveAction={addGraveAction}
        editGraveAction={editGraveAction}
        removeGraveAction={removeGraveAction}
      />
    </article>
  );
}
