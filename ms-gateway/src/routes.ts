import { Hono } from "hono";
import { cors } from "hono/cors";
import { HttpError } from "./errors";
import * as PromotionController from "./controllers/promotion.controller";
import * as InterestController from "./controllers/interest.controller";
import * as SseController from "./controllers/sse.controller";

export function createRoutes(): Hono {
  const app = new Hono();

  app.use("*", cors());

  app.post("/promos", PromotionController.create);
  app.get("/promos", PromotionController.list);
  app.post("/promos/:id/vote", PromotionController.vote);

  app.post("/interests", InterestController.add);
  app.delete("/interests", InterestController.remove);
  app.get("/interests/:clientId", InterestController.listByClient);

  app.get("/sse/:clientId", SseController.connect);

  app.get("/categories", PromotionController.categories);

  app.onError((err, c) => {
    if (err instanceof HttpError) {
      return c.json({ error: err.message }, err.status as 400);
    }
    console.error("Erro inesperado:", err);
    return c.json({ error: "Erro interno" }, 500);
  });

  return app;
}
