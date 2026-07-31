# Alerta de cache offline antigo

A camada `frontendOfflineCacheWarningGenerator` complementa o indicador compacto de cache com um alerta visível acima da listagem.

## Condição

O alerta é exibido quando:

```tsx
list.fetchStatus === 'paused' &&
totalRecords > 0 &&
isOfflineCacheOld
```

O limite de cache antigo permanece definido em 30 minutos pela camada anterior.

## Mensagem

```tsx
<Alert severity="warning" role="status">
  Os dados exibidos estão desatualizados. Última sincronização: {offlineCacheUpdatedAtLabel}.
</Alert>
```

O alerta informa que os registros continuam disponíveis, mas podem não refletir o estado atual do servidor.

## Acessibilidade

O atributo `role="status"` permite que tecnologias assistivas percebam a mudança sem transformar o aviso em uma interrupção crítica.

## Compatibilidade

A camada preserva:

- o estado offline inicial sem registros;
- o indicador de cache antigo;
- a idade relativa do cache;
- o horário exato da última sincronização;
- a região `aria-live` de status da consulta.

## Validação

O contrato correspondente é:

```text
src/cli/validateGeneratedFrontendOfflineCacheWarning.ts
```

Marcador de sucesso:

```text
FRONTEND_OFFLINE_CACHE_WARNING_OK:<entidade>:checks=10:passed=10
```
