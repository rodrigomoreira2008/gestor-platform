# Frontend query status announcement runtime

A camada `frontendQueryStatusAnnouncementGenerator` adiciona uma região viva acessível às páginas geradas.

## Objetivo

Informar leitores de tela quando o estado da consulta muda sem exigir foco manual em chips, barras de progresso ou botões.

## Estados anunciados

A prioridade das mensagens é:

1. consulta pausada aguardando conexão;
2. nova tentativa automática após falha transitória;
3. atualização em segundo plano;
4. dados em cache potencialmente desatualizados.

## Implementação

A página gera `queryStatusMessage` a partir de `fetchStatus`, `failureCount`, `isFetching`, `isLoading`, `isStale` e da quantidade total de registros.

A mensagem é renderizada em um `Box` visualmente oculto com:

- `role="status"`;
- `aria-live="polite"`;
- `aria-atomic="true"`.

Os indicadores visuais anteriores continuam sendo renderizados normalmente.

## Contrato

Execute:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendQueryStatusAnnouncement.ts <dfm> <pas> <entidade> <tabela>
```

Marcador de sucesso:

```text
FRONTEND_QUERY_STATUS_ANNOUNCEMENT_OK:<entidade>:checks=10:passed=10
```
