# Gerador Frontend

## Objetivo

Gerar artefatos React a partir do modelo intermediário `ResolvedForm`.

A versão atual cria um módulo frontend mínimo para validar o fluxo:

```text
ResolvedForm -> types + API + hooks + page
```

## Saída atual

Arquivos gerados:

```text
apps/frontend/src/modules/<modulo>/types/<entidade>.ts
apps/frontend/src/modules/<modulo>/api/index.ts
apps/frontend/src/modules/<modulo>/hooks/index.ts
apps/frontend/src/modules/<modulo>/pages/<Entidade>Page.tsx
```

## CLI

Uso:

```bash
pnpm --filter @gestor/delphi-parser gen:frontend <arquivo.dfm> <arquivo.pas> <entidade> [tabela] [saida]
```

## Mapeamento inicial

- Campo numérico inferido por nome (`valor`, `preco`, `total`, `quantidade`, `qtd`, `codigo`, `id`) -> `number`
- Campo com `data` no nome -> `string`
- Demais campos -> `string`

## Próximas etapas

- Gerar formulário editável usando `CrudPage` ou componentes Material UI;
- Gerar colunas de tabela;
- Gerar schema de validação frontend;
- Gerar rotas e sugestão de item de menu;
- Aproveitar `sectionPath` para preservar agrupamentos do Delphi.
