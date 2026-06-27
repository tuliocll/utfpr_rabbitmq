import { CATEGORIES, type Category } from "shared";
import * as InterestRepo from "../db/interest.repository";
import { HttpError } from "../errors";

export function add(clientId: string, category: unknown): void {
  if (!CATEGORIES.includes(category as Category)) {
    throw new HttpError(400, "Categoria inválida");
  }

  InterestRepo.add(clientId, category as Category);
}

export function remove(clientId: string, category: Category): void {
  InterestRepo.remove(clientId, category);
}

export function listByClient(clientId: string): Category[] {
  return InterestRepo.findByClient(clientId);
}
