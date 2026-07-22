# Relação semântica entre chip e alerta de cache

## Objetivo

Relacionar o chip de última sincronização ao alerta de cache desatualizado para que tecnologias assistivas identifiquem qual região é controlada pelo elemento interativo.

## Comportamento gerado

O alerta recebe um identificador estável:

```tsx
id="offline-cache-warning-alert"
```

O chip passa a declarar:

```tsx
aria-controls="offline-cache-warning-alert"
aria-expanded={isOfflineCacheOld && !isOfflineCacheWarningDismissed}
```

`aria-expanded` fica verdadeiro apenas quando o cache está antigo e o alerta está visível. Ao dispensar o aviso, o valor passa a falso; ao restaurá-lo, volta a verdadeiro.

## Acessibilidade

A implementação preserva:

- foco programático no alerta restaurado;
- retorno de foco ao chip ao dispensar;
- atalho Escape;
- `aria-keyshortcuts="Escape"`;
- descrição acessível do atalho;
- `role="status"`.

## Contrato

Validador:

```text
src/cli/validateGeneratedFrontendOfflineCacheWarningControlRelation.ts
```

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_CONTROL_RELATION_OK:<entidade>:checks=10:passed=10
```

Este contrato integra a matriz de fixtures frontend avançadas.
