//@ts-ignore
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
//@ts-ignore
import { join } from "node:path";
import { generateKeyPair } from "./shared/src/crypto";

const KEYS_DIR = join(import.meta.dir, "keys");
const PRODUCERS = ["gateway", "promotion", "ranking"];

if (!existsSync(KEYS_DIR)) {
  mkdirSync(KEYS_DIR, { recursive: true });
}

for (const name of PRODUCERS) {
  const privatePath = join(KEYS_DIR, `${name}_private.pem`);
  const publicPath = join(KEYS_DIR, `${name}_public.pem`);

  if (existsSync(privatePath)) {
    console.log(`[${name}] Chaves já existem, pulando.`);
    continue;
  }

  const { privateKey, publicKey } = generateKeyPair();
  writeFileSync(privatePath, privateKey);
  writeFileSync(publicPath, publicKey);
  console.log(`[${name}] Chaves geradas.`);
}

console.log(`\nChaves salvas em: ${KEYS_DIR}`);
