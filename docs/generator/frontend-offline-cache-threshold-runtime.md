# Frontend offline cache threshold runtime

## Objetivo

Destacar dados offline que permaneceram sem atualização por tempo elevado.

## Regra

O cache é considerado antigo quando `offlineCacheAgeMinutes >= 30`.

## Comportamento visual

Quando a consulta está pausada e existem registros em cache:

- abaixo de 30 minutos, o indicador continua como `Offline`;
- a partir de 30 minutos, o indicador passa para `Cache antigo`;
- a cor do `Chip` muda de erro para aviso.

O rótulo continua apresentando a idade calculada, como `Cache antigo · há 42 min`.

## Acessibilidade

A região `aria-live` anuncia `Cache antigo` antes de informar que os registros armazenados continuam sendo exibidos.

## Contrato

O validador `validateGeneratedFrontendOfflineCacheThreshold.ts` verifica a condição de 30 minutos, o estado visual, o anúncio acessível e a preservação dos estados offline anteriores.

Marcador de sucesso:

```text
FRONTEND_OFFLINE_CACHE_THRESHOLD_OK:<entidade>:checks=10:passed=10
```
