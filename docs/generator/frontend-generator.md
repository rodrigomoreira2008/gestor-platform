# Gerador Frontend

## Objetivo

Gerar artefatos React a partir do modelo intermediário `ResolvedForm`.

A versão atual cria um módulo frontend mínimo para validar o fluxo:

```text
ResolvedForm -> types + API + hooks + schema + form + columns + page + route/menu snippets
```

## Saída atual

Arquivos gerados:

```text
apps/frontend/src/modules/<modulo>/types/<entidade>.ts
apps/frontend/src/modules/<modulo>/api/index.ts
apps/frontend/src/modules/<modulo>/hooks/index.ts
apps/frontend/src/modules/<modulo>/schema/<entidade>Schema.ts
apps/frontend/src/modules/<modulo>/components/<Entidade>Form.tsx
apps/frontend/src/modules/<modulo>/table/<entidade>Columns.ts
apps/frontend/src/modules/<modulo>/pages/<Entidade>Page.tsx
apps/frontend/src/modules/<modulo>/Generated/<Entidade>Route.tsx.txt
apps/frontend/src/modules/<modulo>/Generated/<Entidade>MenuItem.ts.txt
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

## Colunas de tabela

O gerador também emite um arquivo `table/<entidade>Columns.ts` com colunas Material UI DataGrid para os primeiros campos encontrados no formulário.

## Rotas e menu

O gerador emite snippets `.txt` para rota e item de menu, evitando editar automaticamente arquivos centrais da aplicação nesta etapa.

## Próximas etapas

- Integrar o formulário e as colunas geradas com `CrudPage`;
- Aplicar rotas e menus automaticamente quando a estrutura final estiver estabilizada;
- Aproveitar `sectionPath` para preservar agrupamentos do Delphi.
