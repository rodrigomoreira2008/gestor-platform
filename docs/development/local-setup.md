# Execução Local

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- .NET SDK 9+
- Docker Desktop opcional

## Instalação

```bash
pnpm install
```

## Frontend

```bash
pnpm --filter @gestor/frontend dev
```

Acesse:

```text
http://localhost:5173
```

## Backend

```bash
dotnet run --project apps/backend/Gestor.Api.csproj
```

Acesse:

```text
http://localhost:5000/health
```

Swagger em desenvolvimento:

```text
/swagger
```

## Docker

```bash
docker compose up
```

Serviços:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Validação

```bash
pnpm lint
pnpm build
pnpm test
dotnet build apps/backend/Gestor.Api.csproj
```
