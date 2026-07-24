# Numeric constraint rendering runtime

Esta camada traduz `ResolvedField.numericMinimum` e `ResolvedField.numericMaximum` em validações executáveis.

## Frontend

O gerador Zod usa `renderZodNumericConstraints` para produzir comparações inclusivas ou exclusivas sem interpretar texto livre.

Exemplos:

- mínimo inclusivo 0: `value >= 0`
- mínimo exclusivo 0: `value > 0`
- máximo inclusivo 50: `value <= 50`
- máximo exclusivo 50: `value < 50`

Mensagens inferidas do Pascal são preservadas. Quando ausentes, o gerador cria uma mensagem determinística.

## Backend

`renderCSharpNumericConstraints` produz linhas prontas para o validador C#:

- mínimo inclusivo 0 rejeita `< 0`
- mínimo exclusivo 0 rejeita `<= 0`
- máximo inclusivo 50 rejeita `> 50`
- máximo exclusivo 50 rejeita `>= 50`

O módulo está publicado pela API do pacote. A integração direta no arquivo monolítico `backendGenerator.ts` deve ser feita quando a leitura integral segura desse arquivo estiver disponível, evitando sobrescrita truncada.

## Contrato

Execute:

```bash
pnpm tsx packages/delphi-parser/src/cli/validateNumericConstraintRendering.ts
```

Saída esperada:

```text
NUMERIC_CONSTRAINT_RENDERING_OK:checks=10:passed=10
```

O contrato cobre limites inclusivos e exclusivos, mensagens explícitas e mensagens padrão.