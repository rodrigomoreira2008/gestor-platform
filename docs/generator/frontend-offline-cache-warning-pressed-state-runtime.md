# Estado pressionado do alerta de cache offline

## Objetivo

Representar o chip de última sincronização como um controle de alternância acessível quando ele mostra ou oculta o alerta de dados desatualizados.

## Comportamento gerado

O chip recebe:

```tsx
aria-pressed={isOfflineCacheOld && !isOfflineCacheWarningDismissed}
```

O valor fica alinhado ao estado visual e ao `aria-expanded` existente:

- `true`: o cache está antigo e o alerta está visível;
- `false`: o alerta foi dispensado ou o cache não está antigo.

## Relações preservadas

A camada mantém:

- `aria-controls="offline-cache-warning-alert"`;
- `aria-expanded` dinâmico;
- rótulo de ação dinâmico;
- restauração do alerta pelo chip;
- dispensa pelo botão de fechar ou pela tecla Escape;
- retorno de foco ao chip.

## Contrato

O arquivo `validateGeneratedFrontendOfflineCacheWarningPressedState.ts` verifica a presença do estado pressionado e a preservação das relações acessíveis anteriores.

Marcador de sucesso esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_PRESSED_STATE_OK:<entidade>:checks=10:passed=10
```
