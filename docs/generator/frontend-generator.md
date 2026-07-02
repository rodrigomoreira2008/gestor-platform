# Gerador Frontend

## Objetivo

Gerar artefatos React a partir do modelo intermediário `ResolvedForm`.

A versão atual cria um módulo frontend mínimo para validar o fluxo:

```text
ResolvedForm -> types + API + hooks + schema + form + page
```

## Saída atual

Arquivos gerados:

```text
apps/frontend/src/modules/<modulo>/types/<entidade>.ts
apps/frontend/src/modules/<modulo>/api/index.ts
apps/frontend/src/modules/<modulo>/hooks/index.ts
apps/frontend/src/modules/<modulo>/schema/<entidade>Schema.ts
apps/frontend/src/modules/<modulo>/components/<Entidade>Form.tsx
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

## Validação frontend

O gerador emite um schema Zod inicial. Campos obrigatórios vindos do `ResolvedForm` geram validações `.min(1, mensagem)` quando são strings.

## Formulário

O formulário inicial usa Material UI `TextField`, estado local com `useState` e callback `onSubmit`.

Essa versão ainda é propositalmente simples para validar o pipeline antes de acoplar no `CrudPage` compartilhado.

## Próximas etapas

- Integrar o formulário gerado com `CrudPage`;
- Gerar colunas de tabela;
- Gerar rotas e sugestão de item de menu;
- Aproveitar `sectionPath` para preservar agrupamentos do Delphi.
