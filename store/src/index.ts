import { randomUUID } from "node:crypto";
import * as p from "@clack/prompts";
import { seal, loadKey, CATEGORIES, type Category } from "shared";

const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:3000";

async function main(): Promise<void> {
  p.intro("========= Painel da Loja =========");

  const privatePem = loadKey("store_private.pem");

  while (true) {
    const action = await p.select({
      message: "O que deseja fazer?",
      options: [
        { value: "create", label: "Cadastrar promoção" },
        { value: "exit", label: "Sair" },
      ],
    });

    if (p.isCancel(action) || action === "exit") {
      p.outro("Saindo...");
      process.exit(0);
    }

    await createPromo(privatePem);
  }
}

async function createPromo(privatePem: string): Promise<void> {
  const promo = await p.group(
    {
      title: () =>
        p.text({
          message: "Título da promoção:",
          placeholder: "Ex: Clean Code com 50% off",
          validate: (v) => (v?.length === 0 ? "Obrigatório" : undefined),
        }),

      description: () =>
        p.text({
          message: "Descrição:",
          placeholder: "Detalhes da promoção",
          validate: (v) => (v?.length === 0 ? "Obrigatório" : undefined),
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
          placeholder: "99.90",
          validate: (v) => {
            if (isNaN(parseFloat(v || "0")) || parseFloat(v || "0") <= 0)
              return "Valor inválido";
          },
        }),

      promoPrice: () =>
        p.text({
          message: "Preço promocional (R$):",
          placeholder: "49.90",
          validate: (v) => {
            if (isNaN(parseFloat(v || "0")) || parseFloat(v || "0") <= 0)
              return "Valor inválido";
          },
        }),

      store: () =>
        p.text({
          message: "Nome da loja:",
          placeholder: "Ex: Amazon, Kabum",
          validate: (v) => (v?.length === 0 ? "Obrigatório" : undefined),
        }),

      storeEmail: () =>
        p.text({
          message: "E-mail da loja (para notificações):",
          placeholder: "contato@loja.com",
          validate: (v) => {
            if (!v?.includes("@")) return "E-mail inválido";
          },
        }),
    },
    {
      onCancel: () => {
        p.cancel("Cadastro cancelado.");
      },
    },
  );

  if (!promo.title) return;

  const payload = {
    id: randomUUID(),
    title: promo.title,
    description: promo.description,
    category: promo.category as Category,
    originalPrice: parseFloat(promo.originalPrice),
    salePrice: parseFloat(promo.promoPrice),
    store: promo.store,
    storeEmail: promo.storeEmail,
  };

  const envelope = seal("store", payload, privatePem);

  const spinner = p.spinner();
  spinner.start("Enviando promoção...");

  try {
    const res = await fetch(`${GATEWAY_URL}/promos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: envelope,
    });

    if (res.ok) {
      spinner.stop("Promoção enviada para validação.");
    } else {
      const err = await res.json();
      spinner.stop(`Erro: ${err.error || res.statusText}`);
    }
  } catch (err) {
    spinner.stop("Falha na conexão com o gateway.");
  }
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
