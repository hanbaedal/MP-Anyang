import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Image from "next/image";
import { requireAdmin } from "../../../../lib/auth";
import { filesToDataUrls, fileToDataUrl } from "../../../../lib/images";
import { createGrave, deleteGrave, getGraves, toId, updateGrave } from "../../../../lib/store";

async function addGrave(formData: FormData) {
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

async function editGrave(formData: FormData) {
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

async function removeGrave(formData: FormData) {
  "use server";
  await requireAdmin();
  await deleteGrave(String(formData.get("id")));
  revalidatePath("/admin/graves");
  redirect("/admin/graves");
}

export default async function AdminGravesPage() {
  await requireAdmin();
  const graves = await getGraves();

  return (
    <article className="article">
      <p className="kicker">관리자</p>
      <h1>묘역 관리</h1>
      <p className="lead">묘역 CRUD · 묘역당 최대 10장 사진 · 명절 전 점검일/메모 등록</p>

      <form action={addGrave} className="panel form-grid admin-form" encType="multipart/form-data">
        <p className="admin-badge">새 묘역 등록</p>
        <label>묘번<input name="plotNo" required /></label>
        <label>고인<input name="deceasedName" required /></label>
        <label>성씨<input name="familyName" required /></label>
        <label>구역<input name="zone" required /></label>
        <label>형태<select name="type"><option>봉안묘</option><option>수목장</option><option>매장묘</option><option>평장묘</option></select></label>
        <label>안치일<input name="buriedAt" type="date" required /></label>
        <label>약도 안내<textarea name="mapNote" placeholder="정문 → A구역..." /></label>
        <label>약도 이미지<input name="mapImage" type="file" accept="image/*" /></label>
        <label>묘역 사진 (최대 10장)<input name="photos" type="file" accept="image/*" multiple /></label>
        <label>최근 점검일<input name="lastInspectedAt" type="date" /></label>
        <label>점검 메모<textarea name="inspectNote" placeholder="설·추석 전 점검 내용" /></label>
        <button className="btn btn-primary" type="submit">등록</button>
      </form>

      <div className="list">
        {graves.map((g) => {
          const photos = (g.photos as string[] | undefined) || [];
          return (
            <div key={toId(g._id)} className="list-item">
              <h3>{String(g.plotNo)} · {String(g.deceasedName)}</h3>
              <p>{String(g.zone)} / {String(g.type)} · {String(g.buriedAt)}</p>
              {g.lastInspectedAt ? <p className="meta">점검: {String(g.lastInspectedAt)} — {String(g.inspectNote || "")}</p> : null}
              {photos.length > 0 && (
                <div className="thumb-row">
                  {photos.slice(0, 4).map((src, i) => (
                    <Image key={i} src={src} alt="" width={80} height={60} unoptimized />
                  ))}
                  {photos.length > 4 && <span className="meta">+{photos.length - 4}</span>}
                </div>
              )}

              <form action={editGrave} className="panel form-grid admin-form" encType="multipart/form-data">
                <input type="hidden" name="id" value={toId(g._id)} />
                <label>묘번<input name="plotNo" defaultValue={String(g.plotNo)} /></label>
                <label>고인<input name="deceasedName" defaultValue={String(g.deceasedName)} /></label>
                <label>성씨<input name="familyName" defaultValue={String(g.familyName)} /></label>
                <label>구역<input name="zone" defaultValue={String(g.zone)} /></label>
                <label>형태<input name="type" defaultValue={String(g.type)} /></label>
                <label>안치일<input name="buriedAt" type="date" defaultValue={String(g.buriedAt)} /></label>
                <label>약도 안내<textarea name="mapNote" defaultValue={String(g.mapNote || "")} /></label>
                <label>약도 이미지 교체<input name="mapImage" type="file" accept="image/*" /></label>
                {photos.map((src, i) => (
                  <label key={i} className="check-row">
                    <input type="checkbox" name="keepPhoto" value={src} defaultChecked /> 사진 {i + 1} 유지
                  </label>
                ))}
                <label>추가 사진<input name="photos" type="file" accept="image/*" multiple /></label>
                <label>최근 점검일<input name="lastInspectedAt" type="date" defaultValue={String(g.lastInspectedAt || "")} /></label>
                <label>점검 메모<textarea name="inspectNote" defaultValue={String(g.inspectNote || "")} /></label>
                <button className="btn btn-primary btn-sm" type="submit">수정</button>
              </form>

              <form action={removeGrave} className="admin-actions">
                <input type="hidden" name="id" value={toId(g._id)} />
                <button className="btn btn-danger btn-sm" type="submit">삭제</button>
              </form>
            </div>
          );
        })}
      </div>
    </article>
  );
}
