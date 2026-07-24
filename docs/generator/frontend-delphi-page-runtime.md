# Página frontend orientada aos eventos Delphi

O gerador `renderFrontendDelphiPage()` produz uma variante de página React que evita mutations CRUD diretas na camada de página.

## Criação e edição

A página usa o componente gerado:

```tsx
<ProdutoDelphiDialogController
  open={isCreating || Boolean(editing)}
  value={editing}
  onClose={closeEditor}
/>
```

O diálogo executa o método Pascal associado ao evento de gravação. O runtime decide entre criação e atualização conforme a presença do ID.

## Exclusão

O gerador procura uma ação DFM cujo handler esteja associado a um `MethodActionPlan` com `hasDestructiveAction`.

O executor correspondente é chamado com o registro e seu identificador:

```ts
await executeTProdutoFormBtnExcluirClick(runtime, {
  input: removing as ProdutoInput,
  id: removing.id
});
```

## Ausência de evento

Quando não existe plano destrutivo associado, a confirmação de exclusão gera erro explícito em vez de chamar uma mutation CRUD genérica.

## Arquivo produzido

A função composta `generateFrontendFilesWithDelphiActions()` acrescenta:

```text
pages/<Entidade>DelphiPage.tsx
```

A página original continua sendo gerada para compatibilidade. A aplicação pode trocar sua rota para a variante Delphi após revisar os eventos inferidos.

## Garantias do contrato

O contrato `validateFrontendDelphiPageGenerator.ts` verifica:

- uso do diálogo Delphi;
- uso do runtime Delphi;
- executor destrutivo correto;
- passagem do ID;
- estados de criação, edição e exclusão;
- rastreabilidade do evento DFM;
- ausência de hooks CRUD diretos de criação, atualização e exclusão.
