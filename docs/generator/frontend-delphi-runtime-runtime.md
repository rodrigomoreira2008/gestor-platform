# Frontend Delphi runtime

O gerador pode produzir adaptadores de método Delphi e um runtime React que os conecta às mutations CRUD existentes.

## API recomendada

Use:

```ts
generateFrontendFilesWithDelphiActions(resolved, options)
```

Essa função preserva todos os arquivos de `generateFrontendFiles()` e acrescenta:

```text
delphi/<entidade>DelphiActions.ts
delphi/use<Entidade>DelphiRuntime.ts
```

## Decisão entre criação e atualização

O adaptador Delphi chama apenas:

```ts
runtime.save(input)
```

O hook gerado captura `options.id`:

- sem ID, executa `create.mutateAsync(input)`;
- com ID, executa `update.mutateAsync({ id, input })`.

Isso mantém o plano Pascal independente de React Query e evita inserir regras de interface no modelo intermediário.

## Extensões de runtime

O hook aceita callbacks para:

```text
onClose
onNotify
onOpenDataset
onInvoke
```

A aplicação pode conectá-los a diálogo, navegação, Snackbar, toast ou integrações específicas.

## Contrato

O contrato sintético está em:

```text
packages/delphi-parser/src/cli/validateFrontendDelphiRuntimeGenerator.ts
```

Saída esperada:

```text
FRONTEND_DELPHI_RUNTIME_GENERATOR_OK:checks=10:passed=10
```

A criação dos arquivos no repositório não comprova compilação. Execute o contrato e a validação TypeScript no ambiente local ou no CI.
