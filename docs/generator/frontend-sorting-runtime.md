# Contrato de ordenação do frontend

O validador `validateGeneratedFrontendSorting.ts` garante que a página CRUD gerada preserve uma configuração de ordenação segura e previsível no `DataGrid`.

## Execução

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendSorting.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Para saída estruturada, acrescente `--json`.

## Regras verificadas

O contrato confirma:

- geração da página e do arquivo tipado de colunas;
- uso de `GridColDef<Entidade>[]`;
- presença da coluna `id` como chave estável;
- presença dos principais campos inferidos na tabela;
- ordenação global do `DataGrid` habilitada;
- coluna de ações marcada como `sortable: false`;
- coluna de ações marcada como `filterable: false`;
- composição das colunas com `useMemo`;
- ligação do `DataGrid` à coleção memoizada;
- ausência de um `sortModel` controlado sem gerenciamento completo.

## Marcador de sucesso

Uma validação bem-sucedida imprime um marcador semelhante a:

```text
FRONTEND_SORTING_OK:Produto:checks=12:passed=12
```

## Integração com fixtures

O contrato `sorting` faz parte de `validateFixtureFrontendTabbedForms.ts` e é executado para todas as fixtures oficiais. Com 24 contratos e cinco fixtures, a suíte agregada realiza 120 execuções.

## Falhas comuns

A validação falha quando a ordenação do grid é desabilitada globalmente, quando a coluna de ações pode ser ordenada, quando as colunas não mantêm tipagem da entidade ou quando um modelo de ordenação controlado é introduzido sem o respectivo estado e callback.
