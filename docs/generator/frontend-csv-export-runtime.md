# Contrato de exportação CSV do frontend

O gerador adiciona às páginas CRUD uma ação para exportar a coleção atualmente exibida pelo grid.

## Comportamento gerado

A exportação utiliza `rows`, portanto respeita a composição já aplicada entre:

- pesquisa global;
- filtros avançados;
- dados carregados pela listagem.

Os campos exportados são derivados do identificador e das primeiras colunas da entidade. O arquivo utiliza:

- separador `;`, adequado ao uso comum em planilhas configuradas para `pt-BR`;
- valores entre aspas;
- duplicação de aspas internas;
- BOM UTF-8 para preservar acentos;
- extensão `.csv`;
- nome baseado na entidade.

A ação fica desabilitada durante o carregamento ou quando não há registros exibidos.

## Ciclo do download

O frontend gerado:

1. cria o conteúdo CSV;
2. instancia um `Blob` com `text/csv;charset=utf-8`;
3. cria uma URL temporária;
4. dispara o download por um elemento `a` transitório;
5. remove o elemento;
6. libera a URL com `URL.revokeObjectURL`.

## Validação

O contrato é verificado por:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendCsvExport.ts
```

Execução individual:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendCsvExport.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Marcador esperado:

```text
FRONTEND_CSV_EXPORT_OK:Produto:checks=14:passed=14
```

O validador também integra a suíte agregada das cinco fixtures oficiais.
