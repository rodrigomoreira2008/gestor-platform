# Controlador frontend de ações Delphi

O gerador `renderFrontendDelphiActionController` associa ações coletadas do DFM aos executores produzidos a partir dos métodos Pascal.

## Associação

A associação utiliza:

- `ResolvedAction.event.handlerName`
- `MethodActionPlan.methodName`

O nome do método pode ser simples (`btnGravarClick`) ou qualificado (`TProdutoForm.btnGravarClick`). A comparação é normalizada e aceita o handler como sufixo do método qualificado.

## Artefato gerado

Para a entidade `produto`, o gerador composto cria:

```text
delphi/useProdutoDelphiActionController.ts
```

O hook recebe o estado necessário para executar os métodos:

```ts
const handlers = useProdutoDelphiActionController({
  input,
  id,
  onClose,
  onNotify,
  onInvoke
});
```

As propriedades usam os nomes originais dos componentes DFM:

```ts
await handlers.btnGravar();
await handlers.btnExcluir();
```

## Metadados

O arquivo também exporta metadados estáticos com:

- nome do componente;
- nome do handler Pascal;
- tipo de ação inferido;
- caption original.

Isso permite montar barras de ações ou relatórios de migração sem reler o DFM.

## Eventos sem plano

Quando uma ação possui handler, mas nenhum `MethodActionPlan` correspondente, o código gerado inclui um comentário explícito:

```ts
// Evento sem plano executável: btnImprimir.OnClick -> btnImprimirClick
```

Nenhuma função vazia é criada silenciosamente.

## Gerador composto

`generateFrontendFilesWithDelphiActions` acrescenta agora três arquivos:

```text
delphi/<entidade>DelphiActions.ts
delphi/use<Entidade>DelphiRuntime.ts
delphi/use<Entidade>DelphiActionController.ts
```

## Contrato

O contrato está em:

```text
packages/delphi-parser/src/cli/validateFrontendDelphiActionControllerGenerator.ts
```

Saída esperada:

```text
FRONTEND_DELPHI_ACTION_CONTROLLER_OK:checks=10:passed=10
```
