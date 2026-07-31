# Validação dinâmica das abas frontend

O executor `validateGeneratedFrontendTabs.ts` valida em runtime o arquivo gerado:

```text
apps/frontend/src/modules/<entidade>/tabs/<entidade>Tabs.ts
```

## Execução individual

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendTabs.ts \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para obter o relatório estruturado:

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendTabs.ts \
  arquivo.dfm arquivo.pas Entidade TABELA --json
```

## Contratos verificados

A validação confirma:

- existência do arquivo de abas;
- export `<entidade>Tabs` como array;
- correspondência entre abas inferidas e abas geradas;
- nomes de abas não vazios e sem duplicidade;
- rótulos não vazios;
- `fieldNames` definido como array;
- referências apenas a campos existentes no formulário resolvido;
- preservação da ordem dos campos inferidos;
- confiança restrita a `high`, `medium` ou `low`;
- evidência de inferência não vazia;
- igualdade de nome, rótulo, campos, confiança e evidência em relação ao modelo resolvido;
- ausência de imports externos inesperados;
- execução limitada a um segundo.

## Marcador de sucesso

```text
FRONTEND_TABS_OK:Pedido:tabs=2:fields=8
```

## Integração

O contrato `tabs` faz parte da suíte avançada executada por:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-tabbed-form
```

A suíte percorre os cinco fixtures e executa os contratos em processos isolados. Como esse comando já faz parte do `validate:all` e do GitHub Actions, a validação das definições de abas é executada automaticamente no pipeline.
