# Arquitetura Geral

## Visão

O Gestor Platform é uma plataforma para modernizar sistemas Delphi legados, começando pelo GestorLoc.

A plataforma não será apenas uma aplicação React. Ela será composta por camadas reutilizáveis capazes de gerar telas, APIs e artefatos a partir de uma DSL intermediária.

```text
GestorLoc Delphi
  DFM + PAS + SQL
       ↓
Gestor Converter
       ↓
Gestor DSL
       ↓
Geradores
       ↓
GestorLoc Web
  React + API REST
```

## Camadas

### Apps

- `apps/frontend`: aplicação web final em React.
- `apps/backend`: API REST responsável por regras de negócio, autenticação e persistência.
- `apps/converter`: ferramenta CLI para converter Delphi para DSL.

### Packages

- `packages/ui`: componentes React reutilizáveis.
- `packages/dsl`: tipos, schemas e validações da DSL.
- `packages/parser`: parsers de DFM, PAS e SQL.
- `packages/shared`: utilitários, tipos comuns e contratos.

## Princípios

1. **Migração orientada por metadados**: telas comuns devem ser descritas, não codificadas manualmente.
2. **Conversão incremental**: módulos serão migrados por prioridade e colocados em produção gradualmente.
3. **Preservação das regras de negócio**: regras existentes no Delphi serão extraídas e reimplementadas na API.
4. **UI responsiva por padrão**: desktop, tablets e celulares usarão a mesma aplicação.
5. **Baixo acoplamento**: frontend não acessa banco diretamente; tudo passa pela API.

## Alvo tecnológico

- Frontend: React + TypeScript + Material UI.
- Backend: ASP.NET Core.
- Conversor: TypeScript/Node.js.
- DSL: YAML/JSON validado por schemas.
- Banco: manter banco atual inicialmente, com possibilidade de evolução futura.
