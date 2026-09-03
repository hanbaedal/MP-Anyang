const MAX_BYTES = 450_000;
const MAX_COUNT = 10;

export async function filesToDataUrls(formData: FormData, field: string, max = MAX_COUNT) {
  const files = formData.getAll(field).filter((item): item is File => item instanceof File && item.size > 0);
  const urls: string[] = [];
  for (const file of files.slice(0, max)) {
    if (file.size > MAX_BYTES) {
      throw new Error(`이미지는 장당 450KB 이하로 올려 주세요. (${file.name})`);
    }
    if (!file.type.startsWith("image/")) continue;
    const buf = Buffer.from(await file.arrayBuffer());
    urls.push(`data:${file.type};base64,${buf.toString("base64")}`);
  }
  return urls;
}

export async function fileToDataUrl(formData: FormData, field: string) {
  const urls = await filesToDataUrls(formData, field, 1);
  return urls[0] || "";
}
