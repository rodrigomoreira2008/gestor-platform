# Checklist de validacao do PR

Use este checklist antes de mover artefatos gerados para as aplicacoes reais.

## Parser Delphi

```bash
pnpm --filter @gestor/delphi-parser build
pnpm validate:delphi-fixtures
```

## Validacao individual

```bash
pnpm --filter @gestor/delphi-parser validate:fixture:produtos
pnpm --filter @gestor/delphi-parser validate:fixture:parceiros
pnpm --filter @gestor/delphi-parser validate:fixture:grupo-produtos
pnpm --filter @gestor/delphi-parser validate:fixture:grupo-parceiros
```

## Validacao manual recomendada

- Conferir relatorio de migracao para lookups com confianca media ou baixa.
- Conferir relacionamentos mestre/detalhe inferidos a partir de SQL.
- Conferir endpoints gerados para detalhes antes de conectar com API real.
- Conferir snippets de rota e menu antes de aplicar automaticamente.

## CI

O workflow `Delphi Parser Fixtures` executa build do parser e validacao agregada dos fixtures quando arquivos do parser Delphi sao alterados em pull requests.
