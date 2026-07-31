# Validação de consistência do frontend

O executor `validateGeneratedFrontendConsistency.ts` compara os campos inferidos do formulário Delphi com as principais camadas geradas no módulo React.

## Execução

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendConsistency.ts \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para saída estruturada, acrescente `--json`.

## Camadas comparadas

A validação cruza os nomes de campos presentes em:

- interface TypeScript da entidade;
- schema Zod;
- definições de filtros;
- colunas do `DataGrid`;
- formulário com abas.

O campo técnico `id` é excluído da comparação das propriedades editáveis.

## Contratos

O teste falha quando uma camada:

- omite um campo inferido;
- inclui um campo não pertencente ao formulário;
- duplica nomes;
- utiliza nomenclatura divergente;
- deixa de gerar algum dos arquivos obrigatórios.

Os nomes são comparados após a conversão para `camelCase`, mantendo uma única representação entre tipos, validação, filtros, tabela e formulário.

## Marcador

Uma execução bem-sucedida emite:

```text
FRONTEND_CONSISTENCY_OK:Produto:fields=5:sources=5
```

## Pipeline

O contrato `consistency` integra a suíte `validate:fixture-frontend-tabbed-form`. Com cinco fixtures, sua inclusão acrescenta cinco execuções isoladas ao pipeline avançado do frontend.
