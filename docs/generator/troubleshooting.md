# Troubleshooting do Gerador Delphi

Este documento lista problemas comuns ao usar o parser/gerador Delphi e como diagnosticar.

## Comando nao encontrado

Verifique se esta executando na raiz do monorepo e se as dependencias foram instaladas:

```bash
pnpm install
pnpm --filter @gestor/delphi-parser build
```

## Falha ao ler DFM/PAS

Conferir:

- caminho dos arquivos;
- encoding dos arquivos;
- permissao de leitura;
- se o DFM e textual, nao binario.

## Nenhum campo gerado

Possiveis causas:

- componentes Delphi nao mapeados ainda;
- campos sem `DataField`;
- DFM incompleto;
- tela usa componentes herdados/customizados.

Acao recomendada: revisar o DFM e adicionar o componente ao catalogo em `componentMapping.ts`.

## Lookup incorreto

Possiveis causas:

- `ListSource`, `KeyField` ou `ListField` ausentes;
- relacionamento inferido por SQL com baixa confianca;
- dataset criado dinamicamente no PAS.

Acao recomendada: conferir o relatorio de migracao e ajustar manualmente o lookup gerado.

## Grid detalhe sem dados

Possiveis causas:

- relacionamento mestre/detalhe nao inferido;
- endpoint de detalhe ainda nao existe na API real;
- parametro de consulta diferente do esperado.

Acao recomendada: revisar `details/<entidade>DetailHooks.ts` e o endpoint correspondente.

## Build do frontend falha

Conferir:

- imports gerados;
- dependencias MUI e DataGrid;
- nomes de arquivos/case-sensitive;
- tipos inferidos em campos numericos e booleanos.

## Build do backend falha

Conferir:

- namespace esperado pela aplicacao real;
- tipos C# inferidos;
- usings necessarios;
- registro no DbContext;
- migration gerada.

## Validacao dos fixtures falha

Rodar individualmente para isolar:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture:produtos
pnpm --filter @gestor/delphi-parser validate:fixture:parceiros
pnpm --filter @gestor/delphi-parser validate:fixture:grupo-produtos
pnpm --filter @gestor/delphi-parser validate:fixture:grupo-parceiros
```
