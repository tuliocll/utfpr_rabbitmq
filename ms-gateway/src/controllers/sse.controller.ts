import type { Context } from "hono";
import { addClient } from "../sse";

export function connect(c: Context) {
  const clientId = c.req.param("clientId")!;
  const stream = addClient(clientId);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
