# Validação de acessibilidade do frontend gerado

O executor `validateGeneratedFrontendAccessibility.ts` inspeciona os componentes TSX produzidos pelo gerador e aplica contratos mínimos de acessibilidade e semântica.

## Execução individual

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendAccessibility.ts \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para gerar relatório estruturado:

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendAccessibility.ts \
  arquivo.dfm arquivo.pas Entidade TABELA --json
```

## Contratos verificados

A validação percorre a AST TSX e confirma:

- botões de ícone com `aria-label`;
- botões comuns com texto visível ou nome acessível;
- controles de formulário com `label`, `aria-label` ou `aria-labelledby`;
- formulários com abas renderizados como elemento `form`;
- presença de botão `submit`;
- diálogos com estado `open`;
- grids com `rows` e `columns`;
- ausência de `Box` clicável sem papel semântico;
- nomes acessíveis esperados para editar e excluir;
- campo global de pesquisa identificável.

Erros sintáticos do TSX também fazem a validação falhar.

## Marcador de sucesso

```text
FRONTEND_ACCESSIBILITY_OK:Produto:interactive=8:controls=6:dialogs=3:grids=1
```

Os totais variam conforme os campos, lookups e grids inferidos.

## Integração

O contrato `accessibility` faz parte da suíte avançada executada por:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-tabbed-form
```

A suíte é chamada pelo `validate:all` e pelo workflow de fixtures, portanto todos os formulários de referência passam por essa inspeção automaticamente.
