# Ativação por teclado do alerta de cache offline

O gerador `frontendOfflineCacheWarningKeyboardActivationGenerator.ts` complementa a semântica de botão do chip de sincronização com suporte explícito a teclado.

## Comportamento gerado

O chip recebe:

```tsx
tabIndex={0}
onKeyDown={(event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  event.currentTarget.click();
}}
```

Assim, `Enter` e `Espaço` acionam exatamente a mesma lógica associada ao clique, preservando a alternância entre mostrar e ocultar o alerta.

O `preventDefault()` evita que a tecla Espaço provoque rolagem da página durante a ativação.

## Contrato

O contrato `validateGeneratedFrontendOfflineCacheWarningKeyboardActivation.ts` verifica:

- semântica `role="button"`;
- inclusão do chip na ordem de foco com `tabIndex={0}`;
- suporte às teclas `Enter` e Espaço;
- prevenção do comportamento padrão;
- delegação para o clique do controle;
- preservação de `aria-pressed`, `aria-expanded`, `aria-controls` e `aria-description`.

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_KEYBOARD_ACTIVATION_OK:<entidade>:checks=10:passed=10
```
