import {
  open,
  seal,
  connectRabbit,
  consume,
  publish,
  ROUTING_KEYS,
  loadKey,
  type SalePublishedPayload,
  type SalePayload,
} from "shared";

async function main(): Promise<void> {
  console.log("=== MS Promotion ===\n");

  const privatePem = loadKey("promotion_private.pem");
  const gatewayPubPem = loadKey("gateway_public.pem");

  await connectRabbit(process.env.RABBITMQ_URL);
  console.log("Conectado ao RabbitMQ.");

  await consume("fila_promocao", ROUTING_KEYS.RECEBIDA, (msg) => {
    if (!gatewayPubPem) {
      console.warn(
        "Evento recebido mas sem chave pública do Gateway. Descartando.",
      );
      return;
    }

    const result = open(msg, gatewayPubPem);

    if (!result.ok) {
      console.warn("Assinatura inválida em promocao.recebida. Descartando.");
      return;
    }

    const promo = result.envelope.payload as SalePayload;
    console.log(`Promoção recebida: "${promo.title}" [${promo.category}]`);

    const publishedPayload: SalePublishedPayload = {
      ...promo,
      publishedAt: new Date().toISOString(),
    };

    const envelope = seal("promotion", publishedPayload, privatePem);
    publish(ROUTING_KEYS.PUBLICADA, envelope);

    console.log(`Promoção publicada: "${promo.title}"`);
  });

  console.log("Aguardando promoções...\n");
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
