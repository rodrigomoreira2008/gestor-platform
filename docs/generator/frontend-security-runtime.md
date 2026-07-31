# Validação de segurança do frontend gerado

O executor `validateGeneratedFrontendSecurity.ts` inspeciona os arquivos TypeScript e TSX produzidos pelo gerador antes que eles sejam incorporados à aplicação.

## Execução individual

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendSecurity.ts \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Use `--json` para obter o relatório estruturado.

## Contratos verificados

A validação bloqueia:

- `eval` e `new Function`;
- `dangerouslySetInnerHTML` e atribuições a `innerHTML`;
- uso direto de `localStorage` e `sessionStorage`;
- acesso direto a `document.cookie`;
- redirecionamentos imperativos por `location`;
- URLs HTTP absolutas;
- possíveis segredos embutidos no código;
- chamadas `fetch` fora de `/api/`;
- `credentials: 'include'` sem revisão explícita;
- saída residual por `console.log` e equivalentes.

Quando existem chamadas `fetch`, todas devem encaminhar o `AbortSignal` recebido pelo React Query.

## Marcador de sucesso

```text
FRONTEND_SECURITY_OK:Produto:files=16:fetch=2
```

## Relatório

O relatório contém a quantidade de arquivos inspecionados, chamadas `fetch`, chamadas direcionadas a `/api/`, encaminhamentos de `AbortSignal`, achados de segurança e diagnósticos.

## Pipeline

O contrato `security` faz parte da suíte `validate:fixture-frontend-tabbed-form`, executada pelo `validate:all` e pelo GitHub Actions. Ele roda para os cinco fixtures mantidos pelo pacote.
