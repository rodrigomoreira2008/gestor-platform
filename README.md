# Gestor Platform

Plataforma de modernização do GestorLoc: migração do sistema Delphi legado para uma arquitetura web moderna, responsiva e orientada por metadados.

## Objetivo

Construir uma plataforma reutilizável composta por:

- **Gestor UI**: framework React + TypeScript para telas web responsivas.
- **Gestor API**: framework REST para regras de negócio e integração com banco de dados.
- **Gestor DSL**: linguagem de descrição de telas, entidades, campos e regras.
- **Gestor Converter**: conversor Delphi `.dfm`/`.pas` para DSL e artefatos web.
- **GestorLoc Web**: aplicação web gerada sobre a plataforma.

## Estratégia

O GestorLoc possui centenas de formulários Delphi. Por isso, a migração será feita por plataforma, não por simples cópia tela a tela.

Fluxo proposto:

```text
Delphi DFM/PAS
    ↓
Parser
    ↓
DSL
    ↓
Geradores
    ↓
React + API REST
```

## Estrutura prevista

```text
apps/
  frontend/
  backend/
  converter/
packages/
  ui/
  dsl/
  parser/
  shared/
docs/
  architecture/
  adr/
  migration/
  roadmap.md
database/
docker/
tools/
```

## Status

Sprint 0 em andamento: fundação do repositório, documentação arquitetural e roadmap inicial.
