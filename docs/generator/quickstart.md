# Quickstart do Gerador Delphi

Este guia mostra o fluxo minimo para analisar uma tela Delphi e gerar artefatos Web.

## 1. Build do parser

```bash
pnpm --filter @gestor/delphi-parser build
```

## 2. Validar fixtures existentes

```bash
pnpm validate:delphi-fixtures
```

## 3. Resolver um formulario Delphi

```bash
pnpm --filter @gestor/delphi-parser resolve:form caminho/tela.dfm caminho/tela.pas Entidade TABELA
```

## 4. Gerar backend

```bash
pnpm --filter @gestor/delphi-parser gen:backend caminho/tela.dfm caminho/tela.pas Entidade TABELA saida/backend
```

## 5. Gerar frontend

```bash
pnpm --filter @gestor/delphi-parser gen:frontend caminho/tela.dfm caminho/tela.pas Entidade TABELA saida/frontend
```

## 6. Gerar relatorio de migracao

```bash
pnpm --filter @gestor/delphi-parser gen:report caminho/tela.dfm caminho/tela.pas Entidade TABELA saida/relatorio.md
```

## 7. Validar artefatos gerados em memoria

```bash
pnpm --filter @gestor/delphi-parser validate:generated caminho/tela.dfm caminho/tela.pas Entidade TABELA
```

## 8. Revisar antes de aplicar

Antes de copiar os arquivos para as aplicacoes reais, revisar:

- lookups com confianca media ou baixa;
- relacionamentos mestre/detalhe inferidos;
- endpoints de detalhes;
- snippets de rota e menu;
- campos obrigatorios inferidos a partir do PAS.
