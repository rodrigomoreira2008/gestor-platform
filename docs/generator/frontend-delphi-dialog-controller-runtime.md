# Frontend Delphi dialog controller runtime

O gerador `frontendDelphiDialogControllerGenerator.ts` cria um componente React que conecta o formulário tabulado gerado ao método Pascal de persistência associado ao evento DFM.

## Objetivo

Permitir que o envio de um formulário de criação ou edição execute o fluxo real inferido do Delphi, em vez de chamar diretamente uma mutation CRUD fixa.

## Associação

O gerador procura uma ação DFM com `event.handlerName` e um `MethodActionPlan` correspondente que possua `hasPersistence: true`.

São aceitos métodos simples e qualificados:

```text
btnGravarClick
TProdutoForm.btnGravarClick
```

## Componente gerado

Para `Produto`, o arquivo gerado é:

```text
delphi/ProdutoDelphiDialogController.tsx
```

O componente recebe:

```ts
open
value
onClose
onNotify
onInvoke
title
```

`value?.id` define se o runtime executará criação ou atualização.

## Fluxo

O `onSubmit` do formulário chama o executor Pascal associado:

```ts
await executeTProdutoFormBtnGravarClick(runtime, {
  input,
  id: value?.id
});
```

O executor pode, na ordem inferida:

- validar;
- abrir dataset;
- salvar;
- notificar;
- executar chamada customizada;
- fechar o diálogo.

## Ausência de plano

Quando nenhum evento de persistência é associado, o componente ainda é gerado, mas o submit lança uma mensagem explícita para impedir persistência silenciosa por um fluxo incorreto.

## Contrato

```text
packages/delphi-parser/src/cli/validateFrontendDelphiDialogControllerGenerator.ts
```

Saída esperada:

```text
FRONTEND_DELPHI_DIALOG_CONTROLLER_OK:checks=10:passed=10
```

Este contrato valida somente o texto gerado. A compilação TypeScript e a execução React devem ser verificadas separadamente.
