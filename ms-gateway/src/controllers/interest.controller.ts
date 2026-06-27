import type { Context } from "hono";
import * as InterestService from "../services/interest.service";

export async function add(c: Context) {
  const { clientId, category } = await c.req.json();
  InterestService.add(clientId, category);
  return c.json({ message: `Interesse em '${category}' registrado` });
}

export async function remove(c: Context) {
  const { clientId, category } = await c.req.json();
  InterestService.remove(clientId, category);
  return c.json({ message: `Interesse em '${category}' cancelado` });
}

export function listByClient(c: Context) {
  const clientId = c.req.param("clientId")!;
  return c.json(InterestService.listByClient(clientId));
}
