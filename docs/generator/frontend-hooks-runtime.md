# Validacao dinamica dos hooks frontend

O Delphi Parser executa os hooks CRUD gerados em um ambiente Node isolado para confirmar que o modulo `hooks/index.ts` preserva o contrato esperado com `useCrudResource`.

## Comando individual

```bash
pnpm --filter @gestor/delphi-parser validate:frontend-hooks arquivo.dfm arquivo.pas Entidade TABELA
```

Para obter o relatorio estruturado:

```bash
pnpm --filter @gestor/delphi-parser validate:frontend-hooks arquivo.dfm arquivo.pas Entidade TABELA -- --json
```

## Todos os fixtures

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-hooks
```

## Verificacoes

A validacao confirma que:

- `hooks/index.ts` foi gerado;
- os hooks de listagem, criacao, atualizacao e exclusao existem e sao executaveis;
- todos os hooks encaminham a mesma instancia de `ResourceApi`;
- o nome do recurso e consistente e usa `kebab-case`;
- cada hook retorna a operacao correta de `useCrudResource`;
- imports inesperados nao sao carregados;
- a inicializacao termina dentro do limite de um segundo.

O sucesso produz um marcador no formato:

```text
FRONTEND_HOOKS_OK:Produto:resource=produtos:calls=4
```

A etapa e executada no `validate:all` e no GitHub Actions depois do teste dinamico da API frontend e antes da validacao global de rotas.
