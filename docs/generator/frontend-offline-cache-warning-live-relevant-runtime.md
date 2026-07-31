# Frontend offline cache warning live relevant runtime

## Objetivo

A camada `frontendOfflineCacheWarningLiveRelevantGenerator` refina a região dinâmica associada ao chip de sincronização para que tecnologias assistivas considerem apenas mudanças de texto relevantes.

## Saída gerada

O chip mantém:

```tsx
aria-live="polite"
aria-atomic="true"
```

E passa a incluir:

```tsx
aria-relevant="text"
```

## Comportamento esperado

- Mudanças no rótulo acessível do chip podem ser anunciadas sem interromper o usuário.
- Inserções ou remoções estruturais não são declaradas como conteúdo relevante da região.
- O anúncio permanece atômico.
- Os estados `aria-expanded` e `aria-pressed` continuam sincronizados com a visibilidade do alerta.
- A relação com o alerta via `aria-controls` é preservada.

## Contrato

O validador correspondente é:

```text
src/cli/validateGeneratedFrontendOfflineCacheWarningLiveRelevant.ts
```

Marcador de sucesso esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_LIVE_RELEVANT_OK:<entidade>:checks=10:passed=10
```

## Matriz oficial

O contrato é executado para as cinco fixtures oficiais pela suíte `validateFixtureFrontendTabbedForms.ts`.
