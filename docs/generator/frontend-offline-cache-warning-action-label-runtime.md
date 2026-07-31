# Rótulo de ação do alerta de cache offline

## Objetivo

Tornar a ação do chip de sincronização explícita para leitores de tela, anunciando se a interação irá mostrar ou ocultar o alerta de dados desatualizados.

## Comportamento gerado

O chip recebe um `aria-label` dinâmico:

- `Mostrar alerta de dados desatualizados` quando o alerta foi dispensado;
- `Ocultar alerta de dados desatualizados` quando o alerta está visível;
- `Última sincronização: <horário>` quando o cache não está classificado como antigo.

O rótulo complementa `aria-controls` e `aria-expanded`, preservando a relação semântica com o alerta.

## Contrato

O validador `validateGeneratedFrontendOfflineCacheWarningActionLabel.ts` verifica o rótulo dinâmico, os dois estados de ação, o fallback de sincronização e a preservação dos atributos acessíveis anteriores.

Marcador de sucesso:

```text
FRONTEND_OFFLINE_CACHE_WARNING_ACTION_LABEL_OK:<entidade>:checks=10:passed=10
```
