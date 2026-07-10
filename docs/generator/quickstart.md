# Quickstart do Gerador Delphi

Este guia mostra o fluxo minimo para analisar uma tela Delphi e gerar artefatos Web.

## Indice

O indice completo da documentacao esta em `docs/generator/index.md`.

## Consultar comandos disponiveis

```bash
pnpm --filter @gestor/delphi-parser help
```

O comando apresenta os grupos de analise, geracao e validacao com os principais argumentos.

## 1. Build do parser

```bash
pnpm --filter @gestor/delphi-parser build
```

## 2. Validar fixtures existentes

```bash
pnpm validate:delphi-fixtures
```

Para executar diretamente no pacote:

```bash
pnpm --filter @gestor/delphi-parser validate:all
```

## 3. Resolver um formulario Delphi

```bash
pnpm --filter @gestor/delphi-parser resolve:form caminho/tela.dfm caminho/tela.pas Entidade TABELA
```

O comando de resolucao falha quando nenhum campo e encontrado. Nesse caso, revise o DFM/PAS ou adicione o componente customizado ao mapeamento.

## 4. Validar antes de gerar arquivos

```bash
pnpm --filter @gestor/delphi-parser validate:generated caminho/tela.dfm caminho/tela.pas Entidade TABELA
```

Esse comando falha quando nenhum campo e resolvido, quando ha arquivos vazios, paths duplicados ou grupos obrigatorios ausentes.

## 5. Gerar backend

```bash
pnpm --filter @gestor/delphi-parser gen:backend caminho/tela.dfm caminho/tela.pas Entidade TABELA saida/backend
```

## 6. Gerar frontend

```bash
pnpm --filter @gestor/delphi-parser gen:frontend caminho/tela.dfm caminho/tela.pas Entidade TABELA saida/frontend
```

## 7. Gerar relatorio de migracao

```bash
pnpm --filter @gestor/delphi-parser gen:report caminho/tela.dfm caminho/tela.pas Entidade TABELA saida/relatorio.md
```

Os comandos de geracao tambem falham quando nenhum campo e resolvido.

## 8. Revisar antes de aplicar

Antes de copiar os arquivos para as aplicacoes reais, revisar:

- lookups com confianca media ou baixa;
- relacionamentos mestre/detalhe inferidos;
- endpoints de detalhes;
- snippets de rota e menu;
- campos obrigatorios inferidos a partir do PAS.
