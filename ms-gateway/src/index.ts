import "./db/connection";
import {
  open,
  connectRabbit,
  consume,
  loadKey,
  ROUTING_KEYS,
  type SalePublishedPayload,
} from "shared";
import { createRoutes } from "./routes";
import * as PromotionRepo from "./db/promotion.repository";
import { broadcast, broadcastHotDeal } from "./sse";
import type { ScoreUpdatePayload } from "shared/src/types";

const PORT = Number(process.env.PORT) || 3000;

async function main(): Promise<void> {
  console.log("=== MS Gateway/API ===\n");

  const promotionPubPem = loadKey("promotion_public.pem");
  const rankingPubPem = loadKey("ranking_public.pem");
  console.log("Chaves carregadas.");

  await connectRabbit(process.env.RABBITMQ_URL);
  console.log("Conectado ao RabbitMQ.");

  await consume("fila_gateway", ROUTING_KEYS.PUBLICADA, (msg) => {
    const result = open(msg, promotionPubPem);

    if (!result.ok) {
      console.warn("Assinatura inválida em promocao.publicada. Descartando.");
      return;
    }

    const promo = result.envelope.payload as unknown as SalePublishedPayload;
    PromotionRepo.insert(promo);
    console.log(`Promoção publicada: "${promo.title}"`);
  });

  await consume("fila_gateway_notificacao", "notificacao.*", (msg) => {
    try {
      const notification = JSON.parse(msg);

      if (notification.type === "hot_deal") {
        broadcastHotDeal(notification.category, notification);
        console.log(`SSE hot deal: "${notification.title}"`);
      } else {
        console.log(notification);
        broadcast(notification.category, notification);
        console.log(`SSE ${notification.type}: "${notification.title}"`);
      }
    } catch {
      console.warn("Notificação inválida recebida.");
    }
  });

  await consume("fila_gateway_score", ROUTING_KEYS.SCORE, (msg) => {
    const result = open(msg, rankingPubPem);

    if (!result.ok) {
      console.warn("Assinatura inválida em ranking.score. Descartando.");
      return;
    }

    const score = result.envelope.payload as unknown as ScoreUpdatePayload;
    PromotionRepo.updateScore(
      score.promoId,
      score.upvotes,
      score.downvotes,
      score.isHotDeal,
    );
    console.log(
      `Score atualizado: ${score.promoId} (👍 ${score.upvotes} / 👎 ${score.downvotes})`,
    );
  });

  const app = createRoutes();

  Bun.serve({
    port: PORT,
    idleTimeout: 0,
    fetch: app.fetch,
  });

  console.log(`Servidor rodando em http://localhost:${PORT}\n`);
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
