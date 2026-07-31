# Validação do manifesto frontend gerado

O executor `validateGeneratedFrontendManifest.ts` verifica o conjunto completo de arquivos produzido pelo gerador frontend antes das validações específicas de cada módulo.

## Execução individual

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendManifest.ts \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para receber o relatório estruturado:

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendManifest.ts \
  arquivo.dfm arquivo.pas Entidade TABELA --json
```

## Contratos verificados

A validação confirma:

- raiz correta em `apps/frontend/src/modules/<entidade-plural>`;
- presença dos 18 arquivos-base do módulo;
- um componente adicional para cada grid de detalhe inferido;
- ausência de caminhos duplicados;
- ausência de travessia de diretório;
- uso de separadores de caminho portáveis;
- extensões restritas a `.ts`, `.tsx` e `.txt`;
- conteúdo não vazio e sem byte nulo;
- nomes corretos para tipos, API, hooks, schema, filtros, lookups, detalhes, abas, formulários, tabela, página e snippets de navegação.

## Marcador de sucesso

```text
FRONTEND_MANIFEST_OK:Produto:files=18:directories=12
```

A quantidade de arquivos aumenta conforme o número de grids de detalhe inferidos.

## Integração

O contrato `manifest` faz parte da suíte agregada executada por:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-tabbed-form
```

Com cinco fixtures e dez contratos, a suíte avançada passa a realizar 50 execuções isoladas por rodada.
