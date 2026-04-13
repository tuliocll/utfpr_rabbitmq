import {
  open,
  connectRabbit,
  consume,
  ROUTING_KEYS,
  type SalePublishedPayload,
  loadKey,
} from "shared";
import { showMenu, addPublishedPromo } from "./menu";

async function main(): Promise<void> {
  console.log("=== MS Gateway ===\n");

  const privatePem = loadKey("gateway_private.pem");
  const promotionPubPem = loadKey("promotion_public.pem");

  await connectRabbit(process.env.RABBITMQ_URL);
  console.log("Conectado ao RabbitMQ.");

  await consume("fila_gateway", ROUTING_KEYS.PUBLICADA, (msg) => {
    if (!promotionPubPem) {
      console.warn(
        "Evento promocao.publicada recebido mas sem chave pública do MS Promoção.",
      );
      return;
    }

    const result = open(msg, promotionPubPem);

    if (!result.ok) {
      console.warn(
        "Evento promocao.publicada com assinatura inválida. Descartando.",
      );
      return;
    }

    const promo = result.envelope.payload as SalePublishedPayload;
    addPublishedPromo(promo);
    console.log(
      `\n[Nova promoção publicada] ${promo.title} - R$${promo.salePrice.toFixed(2)}`,
    );
  });

  await showMenu(privatePem);
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
