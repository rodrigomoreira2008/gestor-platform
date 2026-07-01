# Runbook do Piloto: CadastroProdutos

## Objetivo

Executar localmente o primeiro fluxo funcional do GestorLoc migrado para React + .NET.

## Backend

```bash
dotnet run --project apps/backend/Gestor.Api.csproj --urls http://0.0.0.0:5000
```

Validar saúde da API:

```bash
curl http://localhost:5000/health
```

Validar listagem de produtos:

```bash
curl http://localhost:5000/api/produtos
```

## Frontend

```bash
pnpm --filter @gestor/frontend dev
```

Acessar:

```text
http://localhost:5173
```

No menu lateral, abrir:

```text
Produtos
```

## Fluxo de teste manual

1. Abrir a tela Produtos.
2. Clicar em `Novo`.
3. Preencher os campos obrigatórios:
   - Descrição
   - Marca
   - Grupo
   - Valor Estimado
   - Unidade
   - Tipo de Locação
   - Locação
4. Clicar em `Gravar`.
5. Confirmar mensagem de sucesso.
6. Confirmar que a contagem de produtos carregados aumenta.

## Validação de erro

Para validar a regra de obrigatoriedade:

1. Clicar em `Novo`.
2. Deixar campos obrigatórios vazios.
3. Clicar em `Gravar`.
4. A tela deve exibir a mensagem retornada pela API.

## Observações

Neste piloto, o repository ainda é em memória. Portanto, os dados são perdidos ao reiniciar a API.

A próxima evolução será substituir o repository em memória por persistência real via banco de dados.
