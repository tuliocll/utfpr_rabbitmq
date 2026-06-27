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
import { sendMail } from "./mailer";

async function main(): Promise<void> {
  console.log("=== MS Notification ===\n");

  const promotionPubPem = loadKey("promotion_public.pem");
  const rankingPubPem = loadKey("ranking_public.pem");
  console.log("Chaves carregadas.");

  await connectRabbit(process.env.RABBITMQ_URL);
  console.log("Conectado ao RabbitMQ.");

  await consume(
    "fila_notificacao_publicada",
    ROUTING_KEYS.PUBLICADA,
    async (msg) => {
      const result = open(msg, promotionPubPem);

      if (!result.ok) {
        console.warn("Assinatura inválida em promocao.publicada. Descartando.");
        return;
      }

      const promo = result.envelope
        .payload as unknown as SalePublishedPayload & { storeEmail?: string };
      const routingKey = ROUTING_KEYS.category(promo.category);
      console.log(promo);
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

      if (promo.storeEmail) {
        await sendMail({
          to: promo.storeEmail,
          subject: `Promoção aprovada: ${promo.title}`,
          text: [
            `Sua promoção "${promo.title}" foi aprovada e publicada no sistema.`,
            "",
            `Categoria: ${promo.category}`,
            `De R$${promo.originalPrice.toFixed(2)} por R$${promo.salePrice.toFixed(2)}`,
            `Loja: ${promo.store}`,
          ].join("\n"),
        });
      }
    },
  );

  await consume(
    "fila_notificacao_destaque",
    ROUTING_KEYS.DESTAQUE,
    async (msg) => {
      const result = open(msg, rankingPubPem);

      if (!result.ok) {
        console.warn("Assinatura inválida em promocao.destaque. Descartando.");
        return;
      }

      const destaque = result.envelope.payload as unknown as SalePayload & {
        storeEmail?: string;
      };
      const routingKey = ROUTING_KEYS.categoryDestaque(destaque.category);

      const notification = JSON.stringify({
        type: "hot_deal",
        title: destaque.title,
        category: destaque.category,
        score: destaque.score,
      });

      publish(routingKey, notification);
      console.log(
        `Notificação HOT DEAL enviada: [${routingKey}] ${destaque.title}`,
      );

      if (destaque.storeEmail) {
        await sendMail({
          to: destaque.storeEmail,
          subject: `🔥 Hot Deal: ${destaque.title}`,
          text: [
            `Sua promoção "${destaque.title}" virou destaque!`,
            "",
            `Score: ${destaque.score}`,
            `Categoria: ${destaque.category}`,
          ].join("\n"),
        });
      }
    },
  );

  console.log("Aguardando eventos...\n");
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
