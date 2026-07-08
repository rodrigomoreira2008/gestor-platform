# Lacunas conhecidas da migracao automatica

Este documento registra pontos que ainda exigem revisao manual ou evolucao futura do gerador.

## Parser PAS

- Nao interpreta toda a linguagem Pascal.
- Nao resolve heranca, includes ou units auxiliares.
- Nao avalia variaveis usadas para montar SQL dinamico complexo.
- Nao identifica todos os tipos de validacao de negocio.

## Banco de dados

- Relacionamentos sao inferidos principalmente por joins e nomes de colunas.
- Constraints, indices e defaults ainda nao sao gerados automaticamente.
- SQL com alias complexo ou subqueries pode exigir revisao manual.

## Backend

- Relacionamentos Fluent API reais ainda precisam ser refinados antes de aplicar em producao.
- Tipos C# sao inferidos inicialmente por heuristica de nome de campo.
- DbContext ainda recebe snippets em vez de alteracao automatica.

## Frontend

- Rotas e menus sao gerados como snippets para evitar sobrescrever codigo central.
- Endpoints de detalhes usam convencoes iniciais e devem ser revisados.
- Lookups com confianca media ou baixa devem ser conferidos manualmente.
- Componentes gerados validam fluxo funcional inicial, nao layout final pixel-perfect.

## Fixtures

Os fixtures atuais cobrem:

- Produtos;
- Parceiros;
- Grupo de Produtos;
- Grupo de Parceiros.

Ainda faltam fixtures para:

- locacoes;
- financeiro;
- contratos;
- telas com SQL dinamico complexo;
- telas com multiplos grids detalhe.
