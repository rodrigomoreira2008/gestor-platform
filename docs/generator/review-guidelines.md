# Guia de revisao dos artefatos gerados

Este guia orienta a revisao tecnica antes de aplicar os artefatos gerados nas aplicacoes reais.

## Ordem sugerida

1. Rodar `pnpm validate:delphi-fixtures`.
2. Gerar o relatorio de migracao da tela real.
3. Revisar campos, validacoes e tipos inferidos.
4. Revisar lookups e relacionamentos.
5. Revisar backend gerado.
6. Revisar frontend gerado.
7. Copiar artefatos para a aplicacao real em uma branch separada.
8. Rodar build e teste manual do CRUD.

## Backend

Conferir:

- nome da entidade e tabela;
- tipos C# inferidos;
- propriedades obrigatorias;
- validator gerado;
- controller e rotas;
- service gerado;
- EF Configuration;
- snippets de DbContext;
- comandos de migration.

## Frontend

Conferir:

- nomes de modulo, pagina e rota;
- colunas do DataGrid;
- schema Zod;
- filtros;
- tabs;
- lookups;
- grids detalhe;
- endpoints usados pelos hooks.

## Pontos de atencao

- Lookups com confianca media ou baixa devem ser validados com a regra real do sistema.
- Relacionamentos inferidos por SQL devem ser comparados com o banco real.
- Campos `CONTROLE` devem preservar a regra de codigo unico definida para cada cadastro.
- Snippets de rota/menu devem ser aplicados manualmente ate a estrategia automatica estar estabilizada.
