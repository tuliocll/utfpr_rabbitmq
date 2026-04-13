import crypto from "node:crypto";

const KEY_SIZE = 2048;

export interface KeyPair {
  privateKey: string; // PEM format
  publicKey: string; // PEM format
}

export function generateKeyPair(): KeyPair {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: KEY_SIZE,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return { privateKey, publicKey };
}

export function sign(data: string, privatePem: string): string {
  const signer = crypto.createSign("SHA256");
  signer.update(data);
  signer.end();
  return signer.sign(privatePem, "base64");
}

export function verify(
  data: string,
  signatureBase64: string,
  publicPem: string,
): boolean {
  const verifier = crypto.createVerify("SHA256");
  verifier.update(data);
  verifier.end();
  return verifier.verify(publicPem, signatureBase64, "base64");
}
