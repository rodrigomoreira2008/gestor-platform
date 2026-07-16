# Validação dinâmica das colunas frontend

O executor `validateGeneratedFrontendColumns.ts` valida em runtime o arquivo gerado:

```text
apps/frontend/src/modules/<entidade>/table/<entidade>Columns.ts
```

## Execução individual

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendColumns.ts \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para gerar o relatório estruturado, acrescente `--json`.

## Contratos verificados

A validação confirma que:

- o arquivo de colunas foi gerado;
- o export `<entidade>Columns` existe e é um array;
- a primeira coluna representa `id`;
- o cabeçalho da chave é `ID`;
- a largura da chave é `90`;
- os campos seguintes correspondem aos oito primeiros campos inferidos;
- os nomes são convertidos para `camelCase`;
- os rótulos do formulário são preservados como cabeçalhos;
- as colunas de dados usam `flex: 1`;
- não existem campos duplicados;
- o módulo não carrega dependências inesperadas;
- a execução termina em até um segundo.

## Marcador de sucesso

```text
FRONTEND_COLUMNS_OK:Produto:columns=6:data=5
```

## Integração

O contrato `columns` integra a suíte avançada executada por:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-tabbed-form
```

A suíte aplica a validação aos cinco fixtures e já faz parte do `validate:all` e do GitHub Actions.
