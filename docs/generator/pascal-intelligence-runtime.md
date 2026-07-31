# Pascal intelligence runtime

## Objetivo

Evoluir o conversor de um extrator de telas para um modelo intermediário capaz de representar dependências e regras encontradas no código Pascal do GestorLoc.

## Informações extraídas

O parser passa a registrar:

- métodos `procedure` e `function`;
- eventos inferidos por nome ou atribuição explícita;
- units declaradas em blocos `uses`;
- arquivos declarados com `{$I ...}` ou `{$INCLUDE ...}`;
- condições simples iniciadas por `if`;
- atribuições com `:=`;
- chamadas de métodos e procedures;
- interrupções explícitas com `Abort`;
- SQL, datasets e validações já suportados anteriormente.

## Modelo intermediário

O `ResolvedForm` agora pode transportar:

```ts
methods?: PascalMethod[];
events?: PascalEventHint[];
dependencies?: PascalDependencyHint[];
rules?: PascalRuleHint[];
```

Os campos são opcionais para preservar compatibilidade com os geradores e inferências existentes enquanto a nova camada é adotada progressivamente.

## Contrato sintético

O arquivo abaixo valida um formulário Pascal sintético com evento, dependências, include, condição, mensagem, `Abort`, chamada e atribuição:

```text
packages/delphi-parser/src/cli/validatePascalIntelligence.ts
```

Marcador esperado:

```text
PASCAL_INTELLIGENCE_OK:checks=10:passed=10
```

## Limites atuais

Esta etapa não implementa uma AST Pascal completa. As regras são pistas estruturais usadas para análise, relatórios e futuras traduções para TypeScript e C#. Blocos aninhados complexos, `case`, loops, expressões multilinha e resolução entre units ainda exigem evolução posterior.
