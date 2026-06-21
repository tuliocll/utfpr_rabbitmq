# Sistema de Promoções

![Diagrama de eventos](./diagram.png)

![Bun](https://img.shields.io/badge/Bun-000000?style=flat&logo=bun&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Svelte](https://img.shields.io/badge/Svelte-FF3E00?style=flat&logo=svelte&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=flat&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![RSA](https://img.shields.io/badge/RSA-SHA256-4B8BBE?style=flat)

Trabalho da disciplina de Sistemas Distribuídos - PPGCA/UTFPR.

Sistema de gerenciamento de promoções usando microsserviços, RabbitMQ (exchange topic) e assinatura digital RSA.

## Versões do cliente

Este projeto possui duas implementações do cliente, em branches diferentes:

- **`main`** (esta branch): cliente com frontend web escrito em Svelte.
- **`cli-client`**: cliente em CLI escrito em Node.js.

## Arquitetura

Quatro microsserviços independentes que se comunicam exclusivamente via RabbitMQ:

- **ms-gateway**: interface CLI para cadastrar promoções, listar e votar
- **ms-promotion**: valida e publica promoções recebidas
- **ms-ranking**: processa votos e detecta hot deals (score ≥ 5)
- **ms-notification**: redistribui notificações por categoria para os clientes

O **client** é um frontend web (Svelte + Vite + Tailwind CSS) que permite ao usuário se inscrever nas categorias de interesse e exibe as notificações recebidas em tempo real na interface.

Toda mensagem publicada é assinada digitalmente com RSA (SHA-256). O consumidor valida a assinatura antes de processar.

## Requisitos

- [Bun](https://bun.sh)
- Docker (para o RabbitMQ)

## Como rodar

Sobe o RabbitMQ:

```bash
docker compose up -d
```

Gera as chaves RSA (uma vez só):

```bash
bun generate-keys.ts
```

Instala as dependências de cada serviço:

```bash
cd shared && bun install && cd ..
cd ms-gateway && bun install && cd ..
cd ms-promotion && bun install && cd ..
cd ms-ranking && bun install && cd ..
cd ms-notification && bun install && cd ..
cd client && bun install && cd ..
```

Inicia cada microsserviço em um terminal separado, nessa ordem:

```bash
cd ms-promotion && bun start
cd ms-ranking && bun start
cd ms-notification && bun start
cd ms-gateway && bun start
```

Sobe o cliente web (Vite) em outro terminal:

```bash
cd client && bun dev
```

O frontend fica disponível em http://localhost:5173

O painel do RabbitMQ fica disponível em http://localhost:15672

> Usuario: `guest` senha: `guest`.

## Routing keys

| Evento                          | De           | Para                           |
| ------------------------------- | ------------ | ------------------------------ |
| `promocao.recebida`             | Gateway      | Promotion                      |
| `promocao.publicada`            | Promotion    | Gateway, Ranking, Notification |
| `promocao.voto`                 | Gateway      | Ranking                        |
| `promocao.<categoria>`          | Notification | Clientes                       |
| `promocao.<categoria>.destaque` | Ranking      | Notification                   |
