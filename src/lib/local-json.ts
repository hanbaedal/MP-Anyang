import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(file: string, data: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

export function dataFile(name: string) {
  return path.join(process.cwd(), "data", name);
}
