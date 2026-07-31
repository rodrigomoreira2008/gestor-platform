# Contrato de seleção do frontend gerado

O validador `validateGeneratedFrontendSelection.ts` protege o comportamento de seleção única utilizado pela página CRUD gerada e pela carga de grids de detalhe.

## Objetivo

Garantir que a seleção de uma linha seja previsível, tipada e preservada durante ações de edição e exclusão, evitando inconsistências entre o `DataGrid`, os dialogs e os hooks de detalhes.

## Regras verificadas

- a página da entidade deve ser gerada;
- o estado `selected` deve ser tipado como entidade ou `null`;
- `onRowClick` deve atualizar o registro selecionado;
- botões de editar e excluir devem interromper a propagação do clique;
- a seleção automática do `DataGrid` deve permanecer desabilitada;
- páginas com detalhes devem apresentar orientação quando não houver seleção;
- a renderização dos detalhes deve depender de `selected`;
- hooks de detalhes devem receber `selected?.id`;
- a exclusão bem-sucedida deve limpar a seleção quando ela apontar para o registro removido;
- o contrato deve permanecer de seleção única, sem arrays de linhas selecionadas;
- abrir edição não deve limpar a seleção prematuramente;
- abrir a confirmação de exclusão não deve limpar a seleção antes do sucesso.

## Execução

A partir de `packages/delphi-parser`:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendSelection.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Para saída estruturada:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendSelection.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS \
  --json
```

## Marcador de sucesso

```text
FRONTEND_SELECTION_OK:Produto:checks=12:passed=12
```

O contrato também faz parte de `validateFixtureFrontendTabbedForms.ts` e é executado para todas as fixtures oficiais.
