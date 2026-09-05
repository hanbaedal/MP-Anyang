import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Image from "next/image";
import { requireAdmin } from "../../../../lib/auth";
import { fileToDataUrl } from "../../../../lib/images";
import { createParkPhoto, deleteParkPhoto, getParkPhotos, toId } from "../../../../lib/store";

async function addParkPhoto(formData: FormData) {
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

async function removeParkPhoto(formData: FormData) {
  "use server";
  await requireAdmin();
  await deleteParkPhoto(String(formData.get("id")));
  revalidatePath("/admin/park");
  redirect("/admin/park");
}

export default async function AdminParkPage() {
  await requireAdmin();
  const photos = await getParkPhotos();

  return (
    <article className="article">
      <p className="kicker">관리자</p>
      <h1>공원 정보</h1>
      <p className="lead">묘역찾기 모달에서 보여줄 공원 풍광 이미지를 등록합니다.</p>

      <form action={addParkPhoto} className="panel form-grid admin-form" encType="multipart/form-data">
        <p className="admin-badge">공원 풍광 등록</p>
        <label>제목<input name="title" required placeholder="예: 봄 정원" /></label>
        <label>계절<input name="season" placeholder="봄/여름/가을/겨울/사계절" /></label>
        <label>이미지 파일<input name="image" type="file" accept="image/*" /></label>
        <label>또는 이미지 URL<input name="imageUrl" placeholder="https://..." /></label>
        <button className="btn btn-primary" type="submit">등록</button>
      </form>

      <div className="gallery-grid">
        {photos.map((p) => (
          <figure key={toId(p._id)}>
            <Image src={String(p.imageUrl)} alt={String(p.title)} width={400} height={260} unoptimized />
            <figcaption>{String(p.title)}{p.season ? ` (${String(p.season)})` : ""}</figcaption>
            <form action={removeParkPhoto}>
              <input type="hidden" name="id" value={toId(p._id)} />
              <button className="btn btn-danger btn-sm" type="submit">삭제</button>
            </form>
          </figure>
        ))}
      </div>
    </article>
  );
}
