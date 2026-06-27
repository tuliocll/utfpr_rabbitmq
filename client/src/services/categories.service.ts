import { apiFetch } from '../lib/api';

export function getCategories(): Promise<string[]> {
  return apiFetch<string[]>('/categories');
}
