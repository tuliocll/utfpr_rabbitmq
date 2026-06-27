# Sistema de Promoções

![Diagrama de eventos](./docs/preview.png)

![Bun](https://img.shields.io/badge/Bun-000000?style=flat&logo=bun&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Svelte](https://img.shields.io/badge/Svelte-FF3E00?style=flat&logo=svelte&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=flat&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![RSA](https://img.shields.io/badge/RSA-SHA256-4B8BBE?style=flat)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Mailgun](https://img.shields.io/badge/Mailgun-FF6600?style=flat&logo=mailgun&logoColor=white)

Atividade da disciplina de Sistemas Distribuídos - PPGCA/UTFPR, [Profª. Ana Cristina Barreiras Kochem Vendramin](https://sites.google.com/view/anacristina-kochemvendramin).

Sistema de gerenciamento de promoções usando microsserviços, RabbitMQ (exchange topic), assinatura digital RSA, SSE e frontend web (Svelte + Vite + Tailwind CSS).

Este projeto possui duas implementações do cliente, em branches diferentes:

- **`main`** (esta branch): cliente com frontend web escrito em Svelte.
- **`cli-client`**: cliente em CLI escrito em Node.js.

## Requisitos

- [Bun](https://bun.sh)
- [Docker](https://www.docker.com)(para o RabbitMQ)

## Como rodar

Sobe o RabbitMQ:

```sh
docker compose up -d
```

Gera as chaves RSA (uma vez só):

```sh
bun generate-keys.ts
```

Instala as dependências de cada aplicação:

```sh
cd shared && bun install
cd ms-gateway && bun install
cd ms-promotion && bun install
cd ms-ranking && bun install
cd ms-notification && bun install
cd client && bun install
cd store && bun install
```

Crie o `.env` de cada microsserviço a partir do `.env.example` e configure as variáveis de ambiente conforme necessário.

Inicia cada aplicação em um terminal separado:

```sh
cd ms-promotion && bun start
cd ms-ranking && bun start
cd ms-notification && bun start
cd ms-gateway && bun start
cd client && bun start # Frontend web
cd store && bun start # TUI da loja
```

O frontend fica disponível em [http://localhost:5173](http://localhost:5173)

O painel do RabbitMQ fica disponível em [http://localhost:15672](http://localhost:15672)

A documentação da API REST esta disponível [aqui](./docs/API.md).

> Acesso do RabbitMQ, usuário: `guest` senha: `guest`.

## Arquitetura

![Diagrama de arquitetura](./docs/flow.png)

Quatro microsserviços independentes que se comunicam exclusivamente via RabbitMQ:

- **ms-gateway**: API REST que recebe promoções da loja, lista promoções e recebe votos dos clientes, publica eventos no RabbitMQ e envia notificações SSE para o frontend web.
- **ms-promotion**: valida e publica promoções recebidas
- **ms-ranking**: processa votos e detecta hot deals (score ≥ 5)
- **ms-notification**: redistribui notificações por categoria para os clientes e envia e-emails para a loja quando uma promoção é confirmada e/ou detectada como hot deal.

A **store** simula o backoffice da loja, envia promoções para o gateway (não é um microsserviço, apenas um script).

O **client** é um frontend web (Svelte + Vite + Tailwind CSS) que permite ao usuário se inscrever nas categorias de interesse e exibe as notificações recebidas em tempo real na interface.

Toda mensagem publicada é assinada digitalmente com RSA (SHA-256). O consumidor valida a assinatura antes de processar.

## Routing keys

![Diagrama de routing keys](./docs/diagram.png)

| Evento                          | De           | Para                                  |
| ------------------------------- | ------------ | ------------------------------------- |
| `promocao.recebida`             | Gateway      | Promotion                             |
| `promocao.publicada`            | Promotion    | Gateway, Ranking, Notification        |
| `promocao.voto`                 | Gateway      | Ranking                               |
| `promocao.<categoria>`          | Notification | Clientes                              |
| `promocao.<categoria>.destaque` | Ranking      | Notification                          |
| `ranking.score`                 | Ranking      | Gateway (sincroniza DB entre os 2 MS) |

<div align="center">

#### Made with 💙 in Bahia.

</div>
