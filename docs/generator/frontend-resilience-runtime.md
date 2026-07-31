# Validação de resiliência do frontend

O executor `validateGeneratedFrontendResilience.ts` verifica se o código React gerado mantém os contratos mínimos para operações assíncronas, falhas de rede e descarte acidental de alterações.

## Execução

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendResilience.ts \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para obter o relatório estruturado:

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendResilience.ts \
  arquivo.dfm arquivo.pas Entidade TABELA --json
```

## Contratos verificados

A página CRUD deve:

- encaminhar `list.isLoading` ao `DataGrid`;
- renderizar um `Alert` quando a listagem falhar;
- bloquear inclusão, alteração e exclusão durante mutações pendentes;
- fechar diálogos somente após sucesso;
- limpar a seleção quando o registro selecionado for excluído.

O formulário com abas deve:

- validar com `safeParse`;
- proteger alterações por `beforeunload`;
- oferecer a ação Restaurar.

Quando existirem detalhes ou lookups, os hooks devem encaminhar `AbortSignal`, limitar novas tentativas e respeitar a condição `enabled`.

## Marcador de sucesso

```text
FRONTEND_RESILIENCE_OK:Produto:checks=10:passed=10
```

A quantidade de verificações aumenta conforme os detalhes e lookups inferidos.

## Integração

O contrato `resilience` faz parte da suíte agregada executada por:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-tabbed-form
```

Uma falha gera diagnóstico por arquivo e encerra o processo com código diferente de zero.
