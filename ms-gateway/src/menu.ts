import { randomUUID } from "node:crypto";
import * as p from "@clack/prompts";
import {
  publish,
  seal,
  ROUTING_KEYS,
  CATEGORIES,
  type Category,
  type SalePublishedPayload,
  type SaleVotePayload,
  type SalePayload,
} from "shared";

const publishedPromos: SalePublishedPayload[] = [];

export function addPublishedPromo(promo: SalePublishedPayload): void {
  publishedPromos.push(promo);
}

function handleCancel(value: unknown): void {
  if (p.isCancel(value)) {
    p.cancel("Operação cancelada.");
    process.exit(0);
  }
}

export async function showMenu(privatePem: string): Promise<void> {
  p.intro("Sistema de Promoções");

  while (true) {
    const action = await p.select({
      message: "O que deseja fazer?",
      options: [
        { value: "create", label: "Cadastrar promoção" },
        { value: "list", label: "Listar promoções publicadas" },
        { value: "vote", label: "Votar em promoção" },
        { value: "exit", label: "Sair" },
      ],
    });

    handleCancel(action);

    switch (action) {
      case "create":
        await createPromo(privatePem);
        break;
      case "list":
        listPromos();
        break;
      case "vote":
        await votePromo(privatePem);
        break;
      case "exit":
        process.exit(0);
    }
  }
}

async function createPromo(privatePem: string): Promise<void> {
  const promo = await p.group(
    {
      title: () =>
        p.text({
          message: "Título da promoção:",
          placeholder: "Ex: Livro Clean Code com 50% off",
          validate: (v) =>
            v && v.length === 0 ? "Título é obrigatório" : undefined,
        }),

      description: () =>
        p.text({
          message: "Descrição:",
          placeholder: "Detalhes da promoção",
          validate: (v) =>
            v && v.length === 0 ? "Descrição é obrigatória" : undefined,
        }),

      category: () =>
        p.select({
          message: "Categoria:",
          options: CATEGORIES.map((cat) => ({
            value: cat,
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
          })),
        }),

      originalPrice: () =>
        p.text({
          message: "Preço original (R$):",
          placeholder: "50,00",
          validate: (v) => {
            if (!v) return "Preço original é obrigatório";

            const n = parseFloat(v.replace(",", "."));
            if (isNaN(n) || n <= 0) return "Informe um valor válido";
            return undefined;
          },
        }),

      promoPrice: () =>
        p.text({
          message: "Preço promocional (R$):",
          placeholder: "49,90",
          validate: (v) => {
            if (!v) return "Preço promocional é obrigatório";

            const n = parseFloat(v.replace(",", "."));
            if (isNaN(n) || n <= 0) return "Informe um valor válido";
            return undefined;
          },
        }),

      store: () =>
        p.text({
          message: "Loja:",
          placeholder: "Ex: Amazon, Kabum",
          validate: (v) =>
            v && v.length === 0 ? "Loja é obrigatória" : undefined,
        }),
    },
    {
      onCancel: () => {
        p.cancel("Cadastro cancelado.");
      },
    },
  );

  if (!promo.title) return;

  const payload: SalePayload = {
    id: randomUUID(),
    title: promo.title,
    description: promo.description,
    category: promo.category as Category,
    originalPrice: parseFloat(promo.originalPrice),
    salePrice: parseFloat(promo.promoPrice),
    store: promo.store,
  };

  const envelope = seal("gateway", payload, privatePem);
  publish(ROUTING_KEYS.RECEBIDA, envelope);

  p.log.success(`Promoção "${promo.title}" enviada para validação.`);
}

function listPromos(): void {
  if (publishedPromos.length === 0) {
    p.log.warn("Nenhuma promoção publicada ainda.");
    return;
  }

  for (const promo of publishedPromos) {
    const discount = (
      ((promo.originalPrice - promo.salePrice) / promo.originalPrice) *
      100
    ).toFixed(0);

    p.log.info(
      `[${promo.category}] ${promo.title} — R$${promo.salePrice.toFixed(2)} (${discount}% off) — ${promo.store}`,
    );
  }

  p.log.step(`Total: ${publishedPromos.length} promoção(ões)`);
}

async function votePromo(privatePem: string): Promise<void> {
  if (publishedPromos.length === 0) {
    p.log.warn("Nenhuma promoção disponível para votação.");
    return;
  }

  const promoId = await p.select({
    message: "Escolha a promoção:",
    options: publishedPromos.map((promo) => {
      const discount = (
        ((promo.originalPrice - promo.salePrice) / promo.originalPrice) *
        100
      ).toFixed(0);

      return {
        value: promo.id,
        label: `${promo.title} — R$${promo.salePrice.toFixed(2)} (${discount}% off)`,
        hint: promo.store,
      };
    }),
  });

  handleCancel(promoId);

  const vote = await p.select({
    message: "Seu voto:",
    options: [
      { value: "up" as const, label: "Positivo" },
      { value: "down" as const, label: "Negativo" },
    ],
  });

  handleCancel(vote);

  const payload: SaleVotePayload = {
    saleId: promoId as string,
    vote: vote as "up" | "down",
  };

  const envelope = seal("gateway", payload, privatePem);
  publish(ROUTING_KEYS.VOTO, envelope);

  const promoTitle = publishedPromos.find((pr) => pr.id === promoId)?.title;
  p.log.success(`Voto registrado para "${promoTitle}".`);
}
