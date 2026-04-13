import { readFileSync } from "node:fs";
import { join } from "node:path";

export const KEYS_DIR = join(process.cwd(), "..", "keys");

export function loadKey(filename: string): string {
  const path = join(KEYS_DIR, filename);
  return readFileSync(path, "utf-8");
}
