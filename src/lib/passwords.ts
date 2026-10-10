import { scryptSync, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

function verifyScrypt(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash || salt.startsWith("$")) return false;
  try {
    const next = scryptSync(password, salt, 32);
    const prev = Buffer.from(hash, "hex");
    if (next.length !== prev.length) return false;
    return timingSafeEqual(next, prev);
  } catch {
    return false;
  }
}

export async function verifyPassword(password: string, stored: string) {
  if (!stored) return false;
  if (stored.startsWith("$2")) return bcrypt.compare(password, stored);
  return verifyScrypt(password, stored);
}
