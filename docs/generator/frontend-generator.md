# Gerador Frontend

## Objetivo

Gerar artefatos React a partir do modelo intermediario ResolvedForm.

A versao atual cria um modulo frontend CRUD minimo para validar o fluxo:

```text
ResolvedForm -> types + API + hooks + schema + filters + lookups + lookup field + tabs + details + form + tabbed form + columns + CRUD page + route/menu snippets
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
apps/frontend/src/modules/<modulo>/components/<Entidade>LookupField.tsx
apps/frontend/src/modules/<modulo>/tabs/<entidade>Tabs.ts
apps/frontend/src/modules/<modulo>/details/<entidade>DetailGrids.ts
apps/frontend/src/modules/<modulo>/details/<entidade>DetailHooks.ts
apps/frontend/src/modules/<modulo>/details/<Entidade><Grid>DetailGrid.tsx
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
pnpm --filter @gestor/delphi-parser validate:frontend arquivo.dfm arquivo.pas entidade tabela
```

O comando validate:frontend resolve o formulario, gera os artefatos em memoria e valida se os grupos obrigatorios foram emitidos, se ha arquivos vazios e se ha paths duplicados.

## Mapeamento inicial

- Campo numerico inferido por nome: valor, preco, total, quantidade, qtd, codigo, id -> number
- Componentes checkbox Delphi -> boolean
- Campo com data ou componente DateTimePicker -> campo de data
- Demais campos -> string

## Componentes Delphi

O gerador usa o catalogo de mapeamento para escolher componentes React/MUI:

- TEdit e TDBEdit -> TextField
- TDBLookupComboBox e combos -> Autocomplete preparado por LookupField
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

- lookups/<entidade>Lookups.ts com endpoint, lookupSource, valueField, labelField, confianca e evidencia;
- lookups/<entidade>LookupHooks.ts com hooks React Query para carregar opcoes remotas;
- components/<Entidade>LookupField.tsx com um campo reutilizavel baseado em Material UI Autocomplete.

A inferencia agora preserva diretamente as propriedades Delphi `ListSource`, `KeyField` e `ListField`. Quando as tres propriedades estao presentes, o lookup recebe confianca alta. Na ausencia delas, o parser usa relacionamentos, datasets e nomes comuns como fallback.

Os endpoints sao sugeridos a partir da tabela, do ListSource ou do nome do campo, removendo prefixos comuns como `Ds`, `Qry`, `Query`, `Cds`, `Fdq` e `Ado`.

Os hooks gerados:

- aceitam respostas em array direto ou envelopes `items`, `data`, `results` e `rows`;
- cancelam a requisicao por AbortSignal;
- aplicam cache de cinco minutos;
- ordenam as opcoes pelo label em portugues;
- ignoram registros sem chave;
- incluem endpoint, valueField e labelField na query key.

O Autocomplete gerado:

- trata ids numericos e strings equivalentes;
- possui textos de carregamento, vazio, abrir, fechar e limpar;
- exibe progresso durante carregamento e refetch;
- mostra erro de consulta;
- permite desabilitar o carregamento;
- exibe a evidencia quando a inferencia nao possui confianca alta.

Lookups com confianca media ou baixa tambem aparecem no relatorio de migracao para revisao manual.

## Tabs

Quando o parser detecta sectionPath, PageControl ou agrupamentos equivalentes, o gerador emite:

- tabs/<entidade>Tabs.ts com nome da aba, label, campos associados, confianca e evidencia.

A inferencia de abas agora tambem:

- preserva campos sem secao explicita em uma aba Dados gerais;
- elimina campos duplicados dentro da mesma aba;
- gera nomes unicos quando captions diferentes resultam no mesmo identificador;
- mantem a ordem em que as secoes aparecem no formulario Delphi;
- cria uma aba Dados quando nenhum agrupamento e encontrado.

## Grids detalhe

O ResolvedForm tambem recebe detailGrids inferidos a partir de componentes Grid Delphi. Cada grid detalhe tenta preservar:

- nome e titulo amigavel do grid;
- DataSource associado;
- campos vinculados sem duplicacoes;
- campo mestre e campo detalhe do relacionamento;
- relacionamento mestre/detalhe quando inferido;
- nivel de confianca e evidencia.

O gerador frontend emite:

- details/<entidade>DetailGrids.ts com metadados dos grids detalhe;
- details/<entidade>DetailHooks.ts com hooks React Query para carregar detalhes por masterId;
- details/<Entidade><Grid>DetailGrid.tsx com componente Material UI DataGrid para cada grid inferido.

Os DataGrids detalhe gerados incluem pesquisa rapida, paginacao, densidade compacta, estado de erro, titulo, evidencia e identificacao automatica da linha por id, codigo ou controle.

A pagina CRUD gerada conecta os detalhes de forma incremental: ao selecionar uma linha mestre, os hooks de detalhe recebem o id selecionado e a secao Detalhes renderiza os DataGrids inferidos.

Os hooks de detalhe agora montam parametros de consulta a partir do relacionamento inferido quando disponivel. Quando nao ha relacionamento confiavel, usam masterId como fallback.

## Formulario

O formulario inicial usa Material UI, estado local com useState e callback onSubmit. Ele ja diferencia TextField, Checkbox, Select e Date input conforme o componente Delphi inferido.

## Formulario com tabs

O gerador tambem emite components/<Entidade>TabbedForm.tsx. Esse arquivo cria Material UI Tabs usando as abas inferidas e renderiza os campos dentro dos paineis correspondentes.

O TabbedForm tambem aplica componentes conforme o tipo inferido:

- Checkbox para campos booleanos;
- LookupField/Autocomplete para combos e lookups;
- Date para campos/data pickers;
- Number para campos numericos;
- TextField para os demais campos.

O formulario gerado agora possui:

- paineis responsivos em uma coluna no mobile e duas no desktop;
- associacao acessivel entre Tab e tabpanel por id e aria-controls;
- reset do estado e retorno para a primeira aba quando initialValue muda;
- preservacao automatica de campos que nao pertencem a uma aba valida;
- tratamento de campo numerico vazio sem converter para zero;
- indicador de envio no botao Salvar.

Quando nenhuma aba e inferida, o gerador cria uma aba fallback chamada Dados com todos os campos resolvidos.

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
- selecao do registro mestre;
- hooks e DataGrids detalhe por masterId/campo de relacionamento;
- TabbedForm nos dialogos de cadastro e edicao;
- confirmacao de exclusao.

Essa pagina valida o fluxo funcional basico de cadastro, listagem, edicao, exclusao, pesquisa local e visualizacao inicial de detalhes mestre/detalhe.

## Rotas e menu

O gerador emite snippets txt para rota e item de menu, evitando editar automaticamente arquivos centrais da aplicacao nesta etapa.

## Proximas etapas

- Aplicar rotas e menus automaticamente quando a estrutura final estiver estabilizada;
- Criar fixtures de DFM/PAS para validar lookups e grids reais;
- Refinar endpoints mestre/detalhe a partir de metadados reais da API;
- Expandir validate:frontend para checagem sintatica dos TSX gerados.
