# Frontend method action adapters

## Objetivo

Transformar `MethodActionPlan[]` em funções TypeScript executáveis sem acoplar o parser diretamente ao React Query, ao roteador ou à biblioteca de notificações.

## Runtime gerado

O arquivo gerado declara `DelphiActionRuntime`, com adaptadores para:

- `save(input)`
- `remove(id)`
- `openDataset(dataset)`
- `close()`
- `notify(message)`
- `invoke(target, expression)`

Cada método Delphi se torna uma função `execute<Metodo>()` que executa os passos na ordem inferida.

## Tradução

| Plano | Saída frontend |
|---|---|
| `validate` | comentário indicando validação já aplicada pelo schema |
| `openDataset` | chamada opcional a `runtime.openDataset` |
| `save` | `await runtime.save(context.input)` |
| `delete` | validação de `context.id` e `runtime.remove` |
| `message` | `runtime.notify` |
| `invoke` | chamada opcional a `runtime.invoke` e comentário de revisão |
| `close` | `runtime.close` |

## Integração recomendada

A página ou hook React fornece o runtime usando as mutations CRUD existentes. Por exemplo, `save` pode delegar a create/update conforme a presença do identificador, `remove` à mutation de exclusão, `notify` ao sistema de toast e `close` ao fechamento do diálogo ou navegação.

## Limitações

- Condições Pascal são preservadas como comentários; ainda não são convertidas em expressões TypeScript executáveis.
- Atribuições permanecem como comentários de revisão.
- Chamadas customizadas dependem de um `runtime.invoke` fornecido pela aplicação.
- O módulo ainda não é adicionado automaticamente à lista de arquivos de `generateFrontendFiles`; ele está disponível pela API pública para integração controlada.

## Contrato

`validateFrontendMethodActionGenerator.ts` verifica dez pontos e deve produzir:

```text
FRONTEND_METHOD_ACTION_GENERATOR_OK:checks=10:passed=10
```
