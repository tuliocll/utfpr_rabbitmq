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

const HOT_DEAL_THRESHOLD = 5;

interface SaleScore extends SalePayload {
  upvotes: number;
  downvotes: number;
  isHotDeal: boolean;
}

const scores = new Map<string, SaleScore>();

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

    if (!scores.has(payload.id)) {
      scores.set(payload.id, {
        ...payload,
        upvotes: 0,
        downvotes: 0,
        isHotDeal: false,
      });
      console.log(`Promoção registrada no ranking: "${payload.title}"`);
    }
  });

  await consume("fila_ranking", ROUTING_KEYS.VOTO, (msg) => {
    const result = open(msg, gatewayPubPem);

    if (!result.ok) {
      console.warn("Assinatura inválida em promocao.voto. Descartando.");
      return;
    }

    const vote = result.envelope.payload as SaleVotePayload;
    processVote(vote, privatePem);
  });

  console.log(`Aguardando votos... (threshold: ${HOT_DEAL_THRESHOLD})\n`);
}

function processVote(vote: SaleVotePayload, privatePem: string): void {
  let promo = scores.get(vote.saleId);

  if (!promo) {
    console.warn(
      `Voto para promoção desconhecida: ${vote.saleId}. Descartando.`,
    );
    return;
  }

  if (vote.vote === "up") {
    promo.upvotes++;
  } else {
    promo.downvotes++;
  }

  const score = promo.upvotes - promo.downvotes;
  console.log(
    `Voto ${vote.vote} em "${promo.title}" → score: ${score} (${promo.upvotes} / ${promo.downvotes})`,
  );

  if (score >= HOT_DEAL_THRESHOLD && !promo.isHotDeal) {
    promo.isHotDeal = true;

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

    console.log(`HOT DEAL: "${promo.title}" atingiu score ${score}!`);
  }
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
