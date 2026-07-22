# Frontend offline cache warning restore runtime

## Objetivo

Permitir que o usuário reabra manualmente o alerta expandido de cache antigo depois de tê-lo dispensado, sem aguardar reconexão ou mudança do snapshot.

## Comportamento gerado

Quando o cache está antigo e o alerta foi dispensado, o chip compacto permanece visível e torna-se clicável.

Ao clicar no chip:

- o estado `isOfflineCacheWarningDismissed` volta para `false`;
- a chave correspondente é removida do `sessionStorage`;
- o alerta expandido volta a ser exibido;
- a próxima montagem da página não restaura indevidamente a dispensa anterior.

## Acessibilidade

O chip recebe o rótulo:

```text
Mostrar novamente o alerta de cache antigo
```

A ação só fica disponível quando:

- existem registros em cache;
- o cache ultrapassou o limite configurado;
- o alerta expandido está dispensado.

## Contrato

O validador associado é:

```text
src/cli/validateGeneratedFrontendOfflineCacheWarningRestore.ts
```

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_RESTORE_OK:<entidade>:checks=10:passed=10
```
