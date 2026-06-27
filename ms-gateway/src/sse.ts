import type { Category } from "shared";
import * as InterestRepo from "./db/interest.repository";

const clients = new Map<string, ReadableStreamDefaultController>();
const heartbeats = new Map<string, ReturnType<typeof setInterval>>();

const HEARTBEAT_MS = 15_000;

export function addClient(clientId: string): ReadableStream {
  removeClient(clientId);

  const stream = new ReadableStream({
    start(controller) {
      clients.set(clientId, controller);
      controller.enqueue(": connected\n\n");

      // manter a conexão viva.
      const timer = setInterval(() => {
        try {
          controller.enqueue(": ping\n\n");
        } catch {
          removeClient(clientId);
        }
      }, HEARTBEAT_MS);
      heartbeats.set(clientId, timer);
    },
    cancel() {
      removeClient(clientId);
    },
  });

  return stream;
}

export function removeClient(clientId: string): void {
  const timer = heartbeats.get(clientId);
  if (timer) {
    clearInterval(timer);
    heartbeats.delete(clientId);
  }

  const controller = clients.get(clientId);
  if (controller) {
    try {
      controller.close();
    } catch {
      // já fechado
    }
    clients.delete(clientId);
  }
}

export function broadcast(
  category: Category,
  data: object,
  eventType = "notification",
): void {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;

  for (const [clientId, controller] of clients) {
    const interests = InterestRepo.findByClient(clientId);

    if (interests.includes(category)) {
      try {
        controller.enqueue(payload);
      } catch {
        clients.delete(clientId);
      }
    }
  }
}

export function broadcastHotDeal(category: Category, data: object): void {
  broadcast(category, data, "hot_deal");
}
