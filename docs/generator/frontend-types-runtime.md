# Validação dos tipos frontend gerados

O contrato valida o arquivo `types/<entidade>.ts` produzido para cada formulário resolvido.

## Execução individual

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendTypes.ts \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para obter o relatório estruturado:

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendTypes.ts \
  arquivo.dfm arquivo.pas Entidade TABELA --json
```

## Contratos verificados

A validação usa a AST do TypeScript para confirmar:

- existência da interface principal;
- propriedade `id` obrigatória e do tipo `number`;
- quantidade de campos igual à forma resolvida;
- nomes convertidos para `camelCase` e preservados na ordem inferida;
- campos de dados opcionais;
- tipos restritos a `string`, `number` e `boolean`;
- existência de `<Entidade>Input`;
- definição de entrada como `Omit<Entidade, 'id'>`;
- ausência de declarações de runtime no arquivo de tipos;
- inexistência de erros sintáticos.

## Marcador de sucesso

```text
FRONTEND_TYPES_OK:Produto:fields=5:optional=5
```

## Integração

O contrato `types` faz parte da suíte avançada executada por:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-tabbed-form
```

A suíte é chamada pelo `validate:all` e pelo workflow de fixtures do GitHub Actions.
