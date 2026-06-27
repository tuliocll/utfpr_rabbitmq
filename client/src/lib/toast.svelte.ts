export type ToastType = 'success' | 'info' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toasts = $state<Toast[]>([]);
let nextId = 0;

export function getToasts(): Toast[] {
  return toasts;
}

export function showToast(message: string, type: ToastType = 'success', duration = 3000): void {
  const id = nextId++;
  toasts.push({ id, message, type });
  setTimeout(() => dismissToast(id), duration);
}

export function dismissToast(id: number): void {
  toasts = toasts.filter((t) => t.id !== id);
}
