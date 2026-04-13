import { sign, verify } from "./crypto";

export interface Envelope {
  producer: string;
  timestamp: string;
  payload: object;
  signature: string;
}

export function seal(
  producer: string,
  payload: object,
  privatePem: string,
): string {
  // verificação pode falhar se a ordem das chaves mudar.
  const payloadJson = JSON.stringify(payload, Object.keys(payload).sort());

  const signature = sign(payloadJson, privatePem);

  const envelope: Envelope = {
    producer,
    timestamp: new Date().toISOString(),
    payload,
    signature,
  };

  return JSON.stringify(envelope);
}

export function open(
  json: string,
  publicPem: string,
): { ok: true; envelope: Envelope } | { ok: false; error: string } {
  let envelope: Envelope;

  try {
    envelope = JSON.parse(json);
  } catch {
    return { ok: false, error: "invalid_json" };
  }

  // (mesma ordenação de chaves)
  const payloadJson = JSON.stringify(
    envelope.payload,
    Object.keys(envelope.payload).sort(),
  );

  const valid = verify(payloadJson, envelope.signature, publicPem);

  if (valid) {
    return { ok: true, envelope };
  }

  return { ok: false, error: "invalid_signature" };
}
