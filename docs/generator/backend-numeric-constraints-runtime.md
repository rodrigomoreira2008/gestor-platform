# Backend numeric constraints runtime

A geração backend consome diretamente `ResolvedField.numericMinimum` e `ResolvedField.numericMaximum`.

## Tipagem

Campos com qualquer restrição numérica estruturada são emitidos como `decimal?`, mesmo quando o nome do campo não contém pistas como `valor`, `total` ou `quantidade`.

## Operadores

O validador C# representa a condição inválida:

- mínimo inclusivo `>= n` gera rejeição `< n`;
- mínimo exclusivo `> n` gera rejeição `<= n`;
- máximo inclusivo `<= n` gera rejeição `> n`;
- máximo exclusivo `< n` gera rejeição `>= n`.

## Mensagens

A mensagem Pascal inferida é preservada. Quando ausente, uma mensagem determinística é produzida pelo módulo `numericConstraintRendering`.

Mensagens já consumidas por limites estruturados não são repetidas como comentários para revisão manual.

## Compatibilidade

Quando não existem restrições estruturadas, permanecem disponíveis as heurísticas históricas baseadas em expressões como `maior que zero` e `não pode ser negativo`.

## Contrato

Execute:

```bash
pnpm tsx packages/delphi-parser/src/cli/validateGeneratedBackendNumericConstraints.ts
```

Saída esperada:

```text
GENERATED_BACKEND_NUMERIC_CONSTRAINTS_OK:checks=10:passed=10
```
