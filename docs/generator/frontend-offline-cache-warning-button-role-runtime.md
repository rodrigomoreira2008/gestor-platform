# Papel de botão no aviso de cache offline

O gerador `frontendOfflineCacheWarningButtonRoleGenerator.ts` complementa o chip de sincronização com semântica explícita de botão.

## Comportamento gerado

```tsx
role="button"
```

O atributo é aplicado ao mesmo controle que já expõe:

- `aria-controls` para relacionar o chip ao alerta;
- `aria-expanded` para indicar se o alerta está visível;
- `aria-pressed` para indicar o estado de alternância;
- `aria-label` para informar a ação disponível;
- `aria-description` para informar o estado atual;
- `aria-live`, `aria-atomic` e `aria-relevant` para anunciar mudanças.

## Contrato

O contrato `validateGeneratedFrontendOfflineCacheWarningButtonRole.ts` valida 10 marcadores estruturais no arquivo de página gerado.

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_BUTTON_ROLE_OK:<entidade>:checks=10:passed=10
```

## Matriz

O contrato é executado pela matriz `validateFixtureFrontendTabbedForms.ts` para todas as fixtures oficiais.
