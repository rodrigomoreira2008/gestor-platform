# Criterios de aceite do Gerador Delphi

Este documento define criterios objetivos para considerar uma tela Delphi migrada pronta para revisao funcional.

## Entrada

- Arquivos DFM e PAS disponiveis em formato legivel.
- Nome da entidade definido.
- Nome da tabela principal confirmado.
- SQL principal identificado ou tabela principal informada manualmente.

## Geracao

A tela atende ao aceite inicial quando os comandos abaixo executam sem erro:

```bash
pnpm --filter @gestor/delphi-parser validate:generated tela.dfm tela.pas Entidade TABELA
pnpm --filter @gestor/delphi-parser gen:backend tela.dfm tela.pas Entidade TABELA saida/backend
pnpm --filter @gestor/delphi-parser gen:frontend tela.dfm tela.pas Entidade TABELA saida/frontend
pnpm --filter @gestor/delphi-parser gen:report tela.dfm tela.pas Entidade TABELA saida/relatorio.md
```

## Backend

- Entity gerada com campos principais.
- DTO gerado com campos compativeis.
- Validator contem validacoes obrigatorias inferidas.
- Service e Controller gerados.
- EF Configuration referencia a tabela correta.
- Snippet de DbContext revisado.
- Migration planejada e revisada.

## Frontend

- Pagina CRUD gerada.
- DataGrid exibe colunas principais.
- Dialogos de cadastro e edicao renderizam campos.
- Schema Zod gerado.
- Filtros gerados.
- Tabs geradas quando existirem abas Delphi.
- Lookups gerados quando existirem combos/lookup Delphi.
- Grids detalhe gerados quando existirem grids Delphi.

## Revisao manual obrigatoria

- Tipos inferidos.
- Campos obrigatorios.
- Campos `CONTROLE` e regras de codigo unico.
- Lookups com confianca media ou baixa.
- Relacionamentos mestre/detalhe.
- Endpoints reais da API.
- Rotas e menus.

## Pronto para homologacao

A tela pode ir para homologacao quando:

- backend compila na aplicacao real;
- frontend compila na aplicacao real;
- CRUD principal funciona no navegador;
- persistencia no banco foi validada;
- validacoes obrigatorias foram testadas;
- detalhes mestre/detalhe foram testados quando aplicavel.
