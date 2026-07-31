# Contrato de dirty state do frontend

O validador `validateGeneratedFrontendDirtyState.ts` protege o comportamento de alteracoes nao salvas dos formularios com abas gerados pelo conversor Delphi.

## Objetivo

Garantir que o formulario gerado detecte mudancas em relacao ao valor inicial, informe o componente consumidor e proteja o usuario contra perda acidental de dados.

## Regras verificadas

- propriedade opcional `onDirtyChange` tipada com boolean;
- propriedade `warnOnUnsavedChanges` habilitada por padrao;
- baseline serializada armazenada em `useRef`;
- calculo memoizado de `isDirty`;
- propagacao de mudancas por `onDirtyChange`;
- registro e remocao do listener `beforeunload`;
- ativacao do aviso apenas quando houver alteracoes;
- redefinicao da baseline ao restaurar o formulario;
- atualizacao da baseline apos submit valido;
- feedback visual para estado alterado e estado limpo;
- bloqueio do botao Restaurar durante submissao ou sem mudancas;
- anuncio acessivel do estado com `aria-live="polite"`.

## Execucao

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendDirtyState.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Para consumo automatizado:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendDirtyState.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS \
  --json
```

## Marcador de sucesso

```text
FRONTEND_DIRTY_STATE_OK:Produto:checks=14:passed=14
```

O contrato tambem faz parte de `validateFixtureFrontendTabbedForms.ts`, sendo executado para todas as fixtures oficiais.
