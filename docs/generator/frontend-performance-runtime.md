# Validação de performance do frontend gerado

O executor `validateGeneratedFrontendPerformance.ts` verifica contratos de performance estrutural na página CRUD produzida pelo gerador Delphi.

## Objetivo

Evitar regressões simples que aumentem renderizações, recriem estruturas pesadas a cada ciclo do React ou processem conjuntos de dados sem limites previsíveis.

## Execução

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendPerformance.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Para obter um relatório estruturado, acrescente `--json`.

## Contratos verificados

A página gerada deve:

- importar `useMemo` do React;
- memoizar a coleção filtrada `rows`;
- memoizar as colunas do `DataGrid`;
- declarar as dependências `filters`, `list.data` e `search` para o cálculo de linhas;
- manter as colunas com dependências estáveis;
- reutilizar `list.data` sem cópias intermediárias desnecessárias;
- filtrar os dados em uma única passagem;
- não criar o array de colunas diretamente na propriedade `columns`;
- limitar os tamanhos de página a `10`, `25` e `50`;
- iniciar o grid com página de dez registros;
- possuir ao menos dois cálculos memoizados na página CRUD.

## Marcador de sucesso

Uma execução válida produz um marcador semelhante a:

```text
FRONTEND_PERFORMANCE_OK:Produto:checks=11:memo=3
```

## Relatório JSON

O relatório contém:

- situação geral da validação;
- entidade analisada;
- quantidade de arquivos gerados;
- caminho da página inspecionada;
- total de verificações aprovadas e reprovadas;
- resultado individual de cada contrato;
- diagnósticos encontrados;
- marcador de execução, quando não houver falhas.

## Suíte de fixtures

O contrato `performance` integra `validateFixtureFrontendTabbedForms.ts` e é executado para todas as fixtures oficiais do parser.
