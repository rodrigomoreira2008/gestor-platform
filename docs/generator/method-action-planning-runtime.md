# Planejamento de ações por método Pascal

## Objetivo

Transformar regras de negócio inferidas em sequências estruturadas que possam alimentar geradores de frontend, backend e relatórios de migração.

## Modelo

Cada `MethodActionPlan` contém:

- `methodName`;
- `steps` ordenados;
- `hasPersistence`;
- `hasDestructiveAction`;
- `requiresReview`.

Cada passo preserva:

- tipo de ação normalizado;
- regra semântica de origem;
- nó Pascal de origem;
- condição;
- alvo;
- campo;
- mensagem;
- expressão.

## Mapeamentos iniciais

| Regra | Ação |
|---|---|
| `requiredField`, `numericMinimum`, `numericMaximum` | `validate` |
| `ensureDatasetOpen` | `openDataset` |
| `saveDataset` | `save` |
| `deleteRecord` | `delete` |
| `showMessage` | `message` |
| `assignment` | `assign` |
| `customCall` | `invoke` |
| `closeForm` | `close` |

Atribuições e chamadas customizadas são marcadas com `requiresReview: true` porque ainda não existe tradução automática segura para todos os casos.

## Integração

`resolveDelphiForm` gera `methodActionPlans` a partir de `businessRules` e os publica no `ResolvedForm`.

## Contrato

Execute:

```bash
pnpm tsx packages/delphi-parser/src/cli/validateMethodActionPlanning.ts
```

Saída esperada:

```text
METHOD_ACTION_PLANNING_OK:checks=10:passed=10
```
