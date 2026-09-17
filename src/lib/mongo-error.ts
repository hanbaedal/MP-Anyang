/** 로그·채팅에 URI·비밀번호·원문 메시지를 넣지 않습니다. */

/** URI는 있는데 서버에 닿지 못하거나, 분류되지 않은 Mongo 쓰기 실패. */
export const MONGO_WRITE_FAILED = "MongoDB에 복사본을 넣지 못했습니다. MONGODB_URI와 네트워크를 확인하세요.";
export const MONGO_AUTH_FAILED =
  "MongoDB 아이디 또는 비밀번호가 맞지 않습니다. Atlas Database Access와 Render의 MONGODB_URI를 확인하세요.";
export const MONGO_FORBIDDEN =
  "MongoDB에 쓸 권한이 없습니다. Atlas 사용자 권한과 MONGODB_DB(기본 MP-Anyang)를 확인하세요.";
export const MONGO_URI_BAD = "MongoDB 연결 문자열 형식이 잘못되었습니다. Render의 MONGODB_URI를 확인하세요.";
export const MONGO_URI_MISSING = "이 서버에 MONGODB_URI가 없습니다.";

export type MongoShape = {
  name: string;
  code: string | number | undefined;
  codeName: string | undefined;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function walkCauses(err: unknown): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  let cur: unknown = err;
  for (let i = 0; i < 5; i++) {
    const rec = asRecord(cur);
    if (!rec) break;
    rows.push(rec);
    cur = rec.cause;
  }
  return rows;
}

export function inspectMongoError(err: unknown): MongoShape {
  const rows = walkCauses(err);
  let name = "Error";
  let code: string | number | undefined;
  let codeName: string | undefined;
  for (const rec of rows) {
    if (typeof rec.name === "string" && rec.name && name === "Error") name = rec.name;
    if (typeof rec.name === "string" && rec.name.startsWith("Mongo")) name = rec.name;
    if (code === undefined && (typeof rec.code === "number" || typeof rec.code === "string")) code = rec.code;
    if (!codeName && typeof rec.codeName === "string") codeName = rec.codeName;
  }
  return { name, code, codeName };
}

function hintText(err: unknown): string {
  return walkCauses(err)
    .map((rec) => (typeof rec.message === "string" ? rec.message : ""))
    .join("\n")
    .toLowerCase();
}

export function logMongoFailure(context: string, err: unknown) {
  const { name, code, codeName } = inspectMongoError(err);
  console.error(
    `[mongo] ${context} name=${name} code=${code ?? "none"} codeName=${codeName ?? "none"} (URI not logged)`,
  );
}

export function isMongoFailure(err: unknown): boolean {
  const { name, code, codeName } = inspectMongoError(err);
  if (name.startsWith("Mongo")) return true;
  if (code === 13 || code === 18 || code === 8000) return true;
  if (codeName === "Unauthorized" || codeName === "AuthenticationFailed") return true;
  return false;
}

export function mongoUserMessage(err: unknown): string {
  const { name, code, codeName } = inspectMongoError(err);
  const hint = hintText(err);

  if (name === "Error" && (asRecord(err)?.message === "MONGODB_URI missing" || hint.includes("mongodb_uri missing"))) {
    return MONGO_URI_MISSING;
  }
  if (name === "MongoParseError" || hint.includes("invalid connection string") || hint.includes("invalid scheme")) {
    return MONGO_URI_BAD;
  }
  if (
    code === 18 ||
    code === 8000 ||
    codeName === "AuthenticationFailed" ||
    hint.includes("authentication failed") ||
    hint.includes("bad auth") ||
    hint.includes("auth failed")
  ) {
    return MONGO_AUTH_FAILED;
  }
  if (code === 13 || codeName === "Unauthorized" || hint.includes("not authorized") || hint.includes("unauthorized")) {
    return MONGO_FORBIDDEN;
  }
  if (
    name === "MongoServerSelectionError" ||
    name === "MongoNetworkError" ||
    name === "MongoNetworkTimeoutError" ||
    name === "MongoTimeoutError" ||
    hint.includes("whitelist") ||
    hint.includes("enotfound") ||
    hint.includes("econnrefused") ||
    hint.includes("querysrv")
  ) {
    return MONGO_WRITE_FAILED;
  }
  return MONGO_WRITE_FAILED;
}
