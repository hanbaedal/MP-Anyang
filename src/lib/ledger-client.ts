export async function ledgerRequest<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json()) as T & { ok?: boolean; error?: string };
  if (!res.ok || !json.ok) throw new Error(json.error || "처리하지 못했습니다.");
  return json;
}
