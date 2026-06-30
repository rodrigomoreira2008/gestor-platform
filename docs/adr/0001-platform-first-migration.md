# ADR 0001 - Migração orientada por plataforma

## Status

Aceito.

## Contexto

O GestorLoc possui centenas de formulários Delphi, units e regras de negócio espalhadas por código de interface, DataModules e SQL embutido.

Uma migração manual tela a tela para React geraria alto custo, inconsistência visual e risco elevado de perda de regras de negócio.

## Decisão

A migração será feita por meio da criação do **Gestor Platform**, uma plataforma composta por:

- Framework UI.
- API base.
- DSL intermediária.
- Parsers Delphi.
- Geradores React/API.

O GestorLoc Web será gerado e implementado sobre essa plataforma.

## Consequências positivas

- Redução de retrabalho.
- Padrão visual e técnico único.
- Migração incremental.
- Possibilidade de automatizar grande parte dos formulários.
- Base reutilizável para novos módulos e futuros sistemas.

## Consequências negativas

- Investimento inicial maior.
- Necessidade de criar ferramentas antes de migrar muitas telas.
- Maior rigor arquitetural no início do projeto.

## Alternativas consideradas

1. Converter formulário por formulário manualmente.
2. Reescrever todo o ERP sem conversor.
3. Criar plataforma e migrador.

A alternativa 3 foi escolhida por ser mais adequada ao porte do sistema.
