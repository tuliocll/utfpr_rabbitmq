# API

Base: `http://localhost:3000`

## Promoções

Cadastrar (loja envia envelope assinado):

```bash
curl -X POST http://localhost:3000/promos \
  -H "Content-Type: application/json" \
  -d '{"producer":"store","timestamp":"2026-06-22T12:00:00Z","payload":{"id":"abc-123","title":"Clean Code 50% off","description":"Livro do Uncle Bob pela metade","category":"livro","originalPrice":89.90,"promoPrice":44.95,"store":"Amazon"},"signature":"..."}'
```

Listar:

```bash
curl http://localhost:3000/promos
```

Para filtrar por categoria:

```bash
curl http://localhost:3000/promos?category=livro
```

Votar:

```bash
curl -X POST http://localhost:3000/promos/abc-123/vote \
  -H "Content-Type: application/json" \
  -d '{"vote":"up"}'
```

## Interesses

Registrar:

```bash
curl -X POST http://localhost:3000/interests \
  -H "Content-Type: application/json" \
  -d '{"clientId":"client-1","category":"livro"}'
```

Cancelar:

```bash
curl -X DELETE http://localhost:3000/interests \
  -H "Content-Type: application/json" \
  -d '{"clientId":"client-1","category":"livro"}'
```

Consultar:

```bash
curl http://localhost:3000/interests/client-1
```

## SSE

Conectar (fica escutando):

```bash
curl -N http://localhost:3000/sse/client-1
```

## Categorias

```bash
curl http://localhost:3000/categories
```
