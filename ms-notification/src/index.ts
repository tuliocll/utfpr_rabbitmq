import {
  open,
  connectRabbit,
  consume,
  publish,
  loadKey,
  ROUTING_KEYS,
  type SalePublishedPayload,
  type SalePayload,
} from "shared";

async function main(): Promise<void> {
  console.log("=== MS Notification ===\n");

  const promotionPubPem = loadKey("promotion_public.pem");
  const rankingPubPem = loadKey("ranking_public.pem");
  console.log("Chaves carregadas.");

  await connectRabbit(process.env.RABBITMQ_URL);
  console.log("Conectado ao RabbitMQ.");

  await consume("fila_notificacao_publicada", ROUTING_KEYS.PUBLICADA, (msg) => {
    const result = open(msg, promotionPubPem);

    if (!result.ok) {
      console.warn("Assinatura inválida em promocao.publicada. Descartando.");
      return;
    }

    const promo = result.envelope.payload as SalePublishedPayload;
    const routingKey = ROUTING_KEYS.category(promo.category);

    const notification = JSON.stringify({
      type: "nova_promocao",
      title: promo.title,
      description: promo.description,
      category: promo.category,
      originalPrice: promo.originalPrice,
      salePrice: promo.salePrice,
      store: promo.store,
      publishedAt: promo.publishedAt,
    });

    publish(routingKey, notification);
    console.log(`Notificação enviada: [${routingKey}] ${promo.title}`);
  });

  await consume("fila_notificacao_destaque", ROUTING_KEYS.DESTAQUE, (msg) => {
    const result = open(msg, rankingPubPem);

    if (!result.ok) {
      console.warn("Assinatura inválida em promocao.destaque. Descartando.");
      return;
    }

    const destaque = result.envelope.payload as SalePayload;
    const routingKey = ROUTING_KEYS.categoryDestaque(destaque.category);

    const notification = JSON.stringify({
      type: "hot_deal",
      ...destaque,
    });

    publish(routingKey, notification);
    console.log(
      `Notificação HOT DEAL enviada: [${routingKey}] ${destaque.title}`,
    );
  });

  console.log("Aguardando eventos...\n");
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
