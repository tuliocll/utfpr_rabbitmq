import { apiFetch } from '../lib/api';

export function getInterests(clientId: string): Promise<string[]> {
  return apiFetch<string[]>(`/interests/${encodeURIComponent(clientId)}`);
}

export async function addInterest(clientId: string, category: string): Promise<void> {
  await apiFetch('/interests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, category }),
  });
}

export async function removeInterest(clientId: string, category: string): Promise<void> {
  await apiFetch('/interests', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, category }),
  });
}
