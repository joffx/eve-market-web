# EVE Mining Market

Aplicación Next.js para consultar el mercado minero de EVE Online usando únicamente la [API oficial ESI](https://developers.eveonline.com/docs/services/esi/overview/).

Enfocada en minerales, menas (ores), órdenes de venta (sellers) y órdenes de compra (buyers).

## Requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/)

## Instalación

```bash
pnpm install
```

## Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) (redirige a `/market`).

## Build de producción

```bash
pnpm build
pnpm start
```

## Deploy con Docker / GHCR

Imagen publicada por GitHub Actions en push a `main`:

```text
ghcr.io/<owner>/eve-market-web:latest
```

Archivos:

- `Dockerfile` (Next.js standalone)
- `.github/workflows/ghcr.yml`

Secrets del Environment `production` en GitHub:

| Secret | Obligatorio | Descripción |
|--------|-------------|-------------|
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | Sí | `openssl rand -base64 32` |
| `DOKPLOY_WEBHOOK_URL` | No | Webhook de redeploy en Dokploy |

Correr local:

```bash
docker build -t eve-market-web .
docker run --rm -p 3000:3000 eve-market-web
```

## API interna

```
GET /api/market/[typeId]?region=10000002&orderType=buy
```

| Parámetro   | Valores                         | Default |
|------------|----------------------------------|---------|
| `region`   | regionId ESI o omitir (= todas) | todas   |
| `orderType`| `buy` \| `sell` \| `all`         | `all`   |

El servidor consulta ESI (`/markets/{region_id}/orders`), respeta paginación `X-Pages` y cachea ~300 segundos (`revalidate: 300`).

## Datos incluidos

- **Minerales**: Tritanium → Morphite (IDs verificados en ESI)
- **Ores**: Veldspar → Mercoxit + variantes compressed
- **Regiones**: The Forge (Jita), Domain (Amarr), Sinq Laison, Heimatar, Metropolis, Kor-Azor, Tash-Murkon, Khanid, The Citadel

## Scripts

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Alcance actual

Incluye solo minerales + ores + sellers + buyers.

No incluye login EVE, personajes, wallet, base de datos, gráficas ni alertas.
