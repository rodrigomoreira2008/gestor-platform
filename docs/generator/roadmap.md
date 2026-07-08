# Roadmap do Gerador Delphi

Este roadmap organiza as proximas evolucoes do fluxo DFM/PAS -> Web.

## Curto prazo

- Rodar validacoes dos fixtures no CI a cada PR.
- Aumentar cobertura de fixtures com telas reais do GestorLoc.
- Expandir validadores para checagem sintatica dos TS/TSX gerados.
- Expandir validadores para compilacao temporaria dos arquivos C# gerados.

## Medio prazo

- Aplicar rotas e menus automaticamente com estrategia segura de merge.
- Gerar Fluent API real para relacionamentos de alta confianca.
- Melhorar inferencia de tipos usando metadados de dataset e SQL.
- Gerar endpoints mestre/detalhe alinhados aos relacionamentos inferidos.
- Criar relatorio consolidado de lacunas por modulo migrado.

## Longo prazo

- Suportar SQL dinamico mais complexo com variaveis e condicionais.
- Interpretar mais padroes de validacao Pascal.
- Mapear telas com multiplos grids detalhe e fluxos transacionais.
- Criar pipeline completo de migracao assistida por modulo.
- Gerar testes automatizados para backend e frontend a partir dos fixtures.

## Criterios de prontidao

Uma tela migrada deve estar pronta para revisao funcional quando:

- backend e frontend forem gerados sem arquivos vazios ou paths duplicados;
- relatorio de migracao nao tiver lacunas criticas sem revisao;
- lookups e relacionamentos principais forem confirmados;
- build das aplicacoes reais passar apos copiar os artefatos;
- CRUD principal e detalhes forem validados manualmente no navegador.
