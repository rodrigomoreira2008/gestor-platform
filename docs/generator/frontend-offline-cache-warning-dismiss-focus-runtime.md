# Foco ao dispensar alerta de cache antigo

## Objetivo

Fechar o ciclo de navegação por teclado entre o chip de cache antigo e o alerta restaurado.

## Comportamento gerado

A página mantém uma referência para o chip de status:

```tsx
const offlineCacheWarningChipRef = useRef<HTMLDivElement | null>(null);
```

Ao dispensar o alerta novamente, o estado é atualizado e o foco retorna ao chip no próximo frame:

```tsx
setOfflineCacheWarningDismissed(true);
window.requestAnimationFrame(() => {
  offlineCacheWarningChipRef.current?.focus();
});
```

O chip recebe a referência diretamente:

```tsx
<Chip ref={offlineCacheWarningChipRef} />
```

## Acessibilidade

- preserva a posição lógica do usuário após ocultar o alerta;
- evita perda de foco quando o botão de fechar desaparece;
- mantém o chip como ponto de restauração do aviso;
- complementa o foco automático no alerta quando ele é reaberto.

## Contrato

Validador:

```text
src/cli/validateGeneratedFrontendOfflineCacheWarningDismissFocus.ts
```

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_DISMISS_FOCUS_OK:<entidade>:checks=10:passed=10
```

A suíte agregada passa a conter 58 contratos para 5 fixtures, totalizando 290 combinações.
