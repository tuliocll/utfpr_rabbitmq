import "./db/connection";
import {
  open,
  seal,
  connectRabbit,
  consume,
  publish,
  loadKey,
  ROUTING_KEYS,
  type SaleVotePayload,
  type SalePayload,
} from "shared";
import * as ScoreRepo from "./db/score.repository";
import type { ScoreUpdatePayload } from "shared/src/types";

const HOT_DEAL_THRESHOLD = 5;

async function main(): Promise<void> {
  console.log("=== MS Ranking ===\n");

  const privatePem = loadKey("ranking_private.pem");
  const gatewayPubPem = loadKey("gateway_public.pem");
  const promotionPubPem = loadKey("promotion_public.pem");
  console.log("Chaves carregadas.");

  await connectRabbit(process.env.RABBITMQ_URL);
  console.log("Conectado ao RabbitMQ.");

  await consume("fila_ranking_publicada", ROUTING_KEYS.PUBLICADA, (msg) => {
    const result = open(msg, promotionPubPem);

    if (!result.ok) {
      console.warn("Assinatura inválida em promocao.publicada. Descartando.");
      return;
    }

    const payload = result.envelope.payload as any;
    ScoreRepo.register(payload);
    console.log(`Promoção registrada no ranking: "${payload.title}"`);
  });

  await consume("fila_ranking", ROUTING_KEYS.VOTO, (msg) => {
    const result = open(msg, gatewayPubPem);

    if (!result.ok) {
      console.warn("Assinatura inválida em promocao.voto. Descartando.");
      return;
    }

    const vote = result.envelope.payload as unknown as SaleVotePayload;
    processVote(vote, privatePem);
  });

  console.log(`Aguardando votos... (threshold: ${HOT_DEAL_THRESHOLD})\n`);
}

function processVote(vote: SaleVotePayload, privatePem: string): void {
  const promo = ScoreRepo.findById(vote.saleId);

  if (!promo) {
    console.warn(
      `Voto para promoção desconhecida: ${vote.saleId}. Descartando.`,
    );
    return;
  }

  if (vote.previous === "up") {
    ScoreRepo.removeUpvote(vote.saleId);
  } else if (vote.previous === "down") {
    ScoreRepo.removeDownvote(vote.saleId);
  }

  if (vote.vote === "up") {
    ScoreRepo.upvote(vote.saleId);
  } else {
    ScoreRepo.downvote(vote.saleId);
  }

  const updated = ScoreRepo.findById(vote.saleId)!;
  const score = updated.upvotes - updated.downvotes;

  console.log(
    `Voto ${vote.vote} em "${updated.title}" → score: ${score} (👍 ${updated.upvotes} / 👎 ${updated.downvotes})`,
  );

  if (score >= HOT_DEAL_THRESHOLD && !updated.isHotDeal) {
    ScoreRepo.markAsHotDeal(vote.saleId);

    const payload: SalePayload = {
      id: vote.saleId,
      title: promo.title,
      description: promo.description,
      category: promo.category,
      originalPrice: promo.originalPrice,
      salePrice: promo.salePrice,
      store: promo.store,
      score,
    };

    const envelope = seal("ranking", payload, privatePem);
    publish(ROUTING_KEYS.DESTAQUE, envelope);

    console.log(`🔥 HOT DEAL: "${updated.title}" atingiu score ${score}!`);
  }

  // Aqui é uma extensao que fiz
  // para ter os dados atualizados e
  // confiaveis do score, para que o gateway
  // possa atualizar a interface do usuario
  const scorePayload: ScoreUpdatePayload = {
    promoId: vote.saleId,
    upvotes: updated.upvotes,
    downvotes: updated.downvotes,
    isHotDeal: updated.isHotDeal || score >= HOT_DEAL_THRESHOLD,
  };

  const scoreEnvelope = seal("ranking", scorePayload, privatePem);
  publish(ROUTING_KEYS.SCORE, scoreEnvelope);
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
