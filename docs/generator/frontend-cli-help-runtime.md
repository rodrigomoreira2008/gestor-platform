# Ajuda do CLI para geração frontend Delphi

A ajuda do pacote documenta as opções de geração orientada pelos eventos Delphi.

## Comando base

```bash
pnpm --filter @gestor/delphi-parser gen:frontend \
  <arquivo.dfm> \
  <arquivo.pas> \
  <entidade> \
  [tabela] \
  [saida] \
  [opcoes]
```

## Opções

### `--delphi-actions`

Ativa o gerador composto e inclui:

- adaptadores das ações Delphi;
- runtime React;
- controlador de ações;
- controlador de diálogo;
- página orientada aos eventos Delphi;
- snippets de rota.

### `--route-path`

Define o caminho usado nos snippets de rota.

```bash
--route-path=/cadastros/produtos
```

Também é aceita a forma com valor separado:

```bash
--route-path /cadastros/produtos
```

### `--route-export-alias`

Define o nome exportado pelo objeto de rota.

```bash
--route-export-alias=produtoRoute
```

## Exemplo completo

```bash
pnpm --filter @gestor/delphi-parser gen:frontend \
  produto.dfm \
  produto.pas \
  Produto \
  PRODUTOS \
  apps/frontend/src/modules/produtos \
  --delphi-actions \
  --route-path=/cadastros/produtos \
  --route-export-alias=produtoRoute
```

## Contrato

O arquivo `validateFrontendCliHelp.ts` verifica que a ajuda continue contendo:

- a assinatura com `[opcoes]`;
- as três opções Delphi;
- um exemplo completo;
- a referência à documentação principal.
