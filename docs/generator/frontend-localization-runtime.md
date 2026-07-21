# Validação de localização do frontend

O executor `validateGeneratedFrontendLocalization.ts` verifica se os módulos React gerados mantêm textos e operações sensíveis a idioma alinhados ao padrão pt-BR da Gestor Platform.

## Execução

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendLocalization.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Para integração com ferramentas, acrescente `--json`.

## Contratos

A validação inspeciona todos os arquivos TypeScript e TSX produzidos pelo gerador e exige:

- uso explícito de `pt-BR` em normalizações com `toLocaleLowerCase`;
- ausência de chamadas locais sem locale explícito;
- vocabulário CRUD em português;
- placeholders e rótulos de acessibilidade em português;
- presença dos textos principais `Novo`, `Editar`, `Excluir`, `Cancelar` e `Pesquisar` na página CRUD;
- normalização da busca textual com `toLocaleLowerCase('pt-BR')`.

Também identifica termos comuns em inglês expostos ao usuário, como `New`, `Edit`, `Delete`, `Cancel`, `Save`, `Search`, `Loading` e `Error`.

## Saída de sucesso

```text
FRONTEND_LOCALIZATION_OK:Produto:files=16:locale=3:messages=24
```

Os contadores indicam a quantidade de arquivos inspecionados, usos explícitos do locale e mensagens de interface encontradas.

## Relatório JSON

```json
{
  "ok": true,
  "entity": "Produto",
  "generatedFiles": 18,
  "inspectedFiles": 16,
  "locale": "pt-BR",
  "localeUsages": 3,
  "userMessages": 24,
  "findings": [],
  "runtimeMarker": "FRONTEND_LOCALIZATION_OK:Produto:files=16:locale=3:messages=24",
  "diagnostics": []
}
```

O contrato faz parte da suíte agregada `validateFixtureFrontendTabbedForms.ts` e é executado para todas as fixtures oficiais.
