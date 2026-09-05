import { pingDb } from "../../../lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbName = await pingDb();
    return Response.json({ ok: true, db: dbName });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("[health]", error);
    return Response.json({ ok: false, error: message }, { status: 503 });
  }
}
