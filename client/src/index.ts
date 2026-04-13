import { randomUUID } from "node:crypto";
import * as p from "@clack/prompts";
import {
  connectRabbit,
  EXCHANGE_NAME,
  ROUTING_KEYS,
  CATEGORIES,
  type Category,
} from "shared";
import type { SalePayload } from "shared";

async function main(): Promise<void> {
  const clientId = randomUUID().slice(0, 8);

  p.intro(`Cliente ${clientId}`);

  const interests = await p.multiselect({
    message: "Quais categorias deseja acompanhar? (use espaço para selecionar)",
    options: CATEGORIES.map((cat) => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
    })),
    required: true,
  });

  if (p.isCancel(interests)) {
    p.cancel("Cancelado.");
    process.exit(0);
  }

  const followHotDeals = await p.confirm({
    message:
      "Deseja receber notificações de promoções em destaque (hot deals)?",
    initialValue: true,
  });

  if (p.isCancel(followHotDeals)) {
    p.cancel("Cancelado.");
    process.exit(0);
  }

  const channel = await connectRabbit(process.env.RABBITMQ_URL);

  const { queue } = await channel.assertQueue(`client_queue_${clientId}`, {
    exclusive: true,
  });

  for (const category of interests as Category[]) {
    const routingKey = ROUTING_KEYS.category(category);
    await channel.bindQueue(queue, EXCHANGE_NAME, routingKey);
    p.log.step(`Inscrito em: ${routingKey}`);
  }

  if (followHotDeals) {
    await channel.bindQueue(queue, EXCHANGE_NAME, "promocao.*.destaque");
    p.log.step("Inscrito em: promocao.*.destaque");
  }

  p.log.success("Aguardando notificações...\n");

  channel.consume(queue, (msg) => {
    if (!msg) return;

    try {
      const notification = JSON.parse(msg.content.toString());
      displayNotification(notification);
      channel.ack(msg);
    } catch (e) {
      console.error(e);
      console.error("Erro ao processar mensagem:", msg.content.toString());
      console.warn("Mensagem inválida recebida.");
    }
  });
}

function displayNotification(
  notification: SalePayload & { type: string },
): void {
  const timestamp = new Date().toLocaleTimeString("pt-BR");

  const discount = (
    ((notification.originalPrice - notification.salePrice) /
      notification.originalPrice) *
    100
  ).toFixed(0);

  if (notification.type === "hot_deal") {
    p.log.warn(
      `[${timestamp}] HOT DEAL! "${notification.title}" [${notification.category}] — R$${notification.salePrice.toFixed(2)} (${discount}% off) — score: ${notification.score}`,
    );
  } else {
    p.log.info(
      `[${timestamp}] "${notification.title}" [${notification.category}] — R$${notification.salePrice.toFixed(2)} (${discount}% off) — ${notification.store}`,
    );
  }
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
