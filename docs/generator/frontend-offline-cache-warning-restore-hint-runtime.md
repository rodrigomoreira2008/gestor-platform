# Frontend offline cache warning restore hint runtime

## Objetivo

Tornar a restauração manual do alerta de cache antigo mais fácil de descobrir sem adicionar novos controles visuais.

## Comportamento gerado

Quando existem registros em cache, o chip mantém o horário da última sincronização no atributo `title`.

Se o cache está antigo e o alerta foi dispensado, o tooltip passa a iniciar com:

```text
Clique para mostrar novamente o alerta.
```

Em seguida, continua apresentando o horário exato:

```text
Última sincronização: <data e hora>
```

Quando o alerta não está dispensado, o tooltip exibe somente a última sincronização.

## Acessibilidade

O chip continua usando o `aria-label` específico para restauração e permanece clicável somente quando:

- existem registros em cache;
- o cache está antigo;
- o alerta foi dispensado.

## Contrato

Validador:

```text
src/cli/validateGeneratedFrontendOfflineCacheWarningRestoreHint.ts
```

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_RESTORE_HINT_OK:<entidade>:checks=10:passed=10
```
