# Gerador Frontend

## Objetivo

Gerar artefatos React a partir do modelo intermediario ResolvedForm.

A versao atual cria um modulo frontend CRUD minimo para validar o fluxo:

```text
ResolvedForm -> types + API + hooks + schema + filters + lookups + tabs + form + tabbed form + columns + CRUD page + route/menu snippets
```

## Saida atual

Arquivos gerados:

```text
apps/frontend/src/modules/<modulo>/types/<entidade>.ts
apps/frontend/src/modules/<modulo>/api/index.ts
apps/frontend/src/modules/<modulo>/hooks/index.ts
apps/frontend/src/modules/<modulo>/schema/<entidade>Schema.ts
apps/frontend/src/modules/<modulo>/filters/<entidade>Filters.ts
apps/frontend/src/modules/<modulo>/lookups/<entidade>Lookups.ts
apps/frontend/src/modules/<modulo>/lookups/<entidade>LookupHooks.ts
apps/frontend/src/modules/<modulo>/tabs/<entidade>Tabs.ts
apps/frontend/src/modules/<modulo>/components/<Entidade>Form.tsx
apps/frontend/src/modules/<modulo>/components/<Entidade>TabbedForm.tsx
apps/frontend/src/modules/<modulo>/table/<entidade>Columns.ts
apps/frontend/src/modules/<modulo>/pages/<Entidade>Page.tsx
apps/frontend/src/modules/<modulo>/Generated/<Entidade>Route.tsx.txt
apps/frontend/src/modules/<modulo>/Generated/<Entidade>MenuItem.ts.txt
```

## CLI

Uso:

```bash
pnpm --filter @gestor/delphi-parser gen:frontend arquivo.dfm arquivo.pas entidade tabela saida
```

## Mapeamento inicial

- Campo numerico inferido por nome: valor, preco, total, quantidade, qtd, codigo, id -> number
- Componentes checkbox Delphi -> boolean
- Campo com data ou componente DateTimePicker -> campo de data
- Demais campos -> string

## Componentes Delphi

O gerador usa o catalogo de mapeamento para escolher componentes React/MUI:

- TEdit e TDBEdit -> TextField
- TDBLookupComboBox e combos -> Select preparado para lookup
- TCheckBox e TDBCheckBox -> Checkbox
- TDateTimePicker -> TextField date
- TDBGrid e TStringGrid -> DataGrid
- TPageControl e TTabSheet -> tabs inferidas

## Validacao frontend

O gerador emite um schema Zod inicial. Campos obrigatorios vindos do ResolvedForm geram validacoes quando sao strings. Campos booleanos e numericos usam validacoes compativeis com o tipo inferido.

## Filtros

O gerador emite filters/<entidade>Filters.ts com filtros tipados por campo. A pagina usa esses filtros para pesquisa textual local nos registros carregados.

## Lookups

Quando o parser detecta combos ou componentes de lookup, o gerador emite:

- lookups/<entidade>Lookups.ts com endpoint, valueField, labelField, confianca e evidencia;
- lookups/<entidade>LookupHooks.ts com hooks React Query para carregar opcoes remotas.

Lookups com confianca media ou baixa tambem aparecem no relatorio de migracao para revisao manual.

## Tabs

Quando o parser detecta sectionPath, PageControl ou agrupamentos equivalentes, o gerador emite:

- tabs/<entidade>Tabs.ts com nome da aba, label, campos associados, confianca e evidencia.

## Formulario

O formulario inicial usa Material UI, estado local com useState e callback onSubmit. Ele ja diferencia TextField, Checkbox, Select e Date input conforme o componente Delphi inferido.

## Formulario com tabs

O gerador tambem emite components/<Entidade>TabbedForm.tsx. Esse arquivo cria um scaffold com Material UI Tabs usando as abas inferidas e reaproveita o formulario base.

Nesta etapa, o TabbedForm ainda funciona como uma camada de estrutura para evolucao incremental. O proximo passo e mover/renderizar cada campo dentro do respectivo painel de aba.

## Pagina CRUD

A pagina gerada usa:

- Material UI DataGrid;
- colunas geradas em table/<entidade>Columns.ts;
- hook de listagem;
- hook de criacao;
- hook de edicao;
- hook de exclusao;
- pesquisa textual local;
- metadata de tabs inferidas;
- dialogo de cadastro;
- dialogo de edicao;
- confirmacao de exclusao.

Essa pagina valida o fluxo funcional basico de cadastro, listagem, edicao, exclusao e pesquisa local.

## Rotas e menu

O gerador emite snippets txt para rota e item de menu, evitando editar automaticamente arquivos centrais da aplicacao nesta etapa.

## Proximas etapas

- Trocar selects de lookup por Autocomplete completo;
- Mover campos para os paineis corretos do TabbedForm;
- Gerar grids detalhe para telas mestre/detalhe;
- Aplicar rotas e menus automaticamente quando a estrutura final estiver estabilizada.
