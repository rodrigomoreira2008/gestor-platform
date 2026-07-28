# Contratos agregados do CLI de frontend

Este documento descreve os contratos que protegem a interface de linha de comando usada para gerar frontend React/MUI a partir de formularios Delphi.

## Escopo

O fluxo cobre:

- leitura dos argumentos posicionais;
- ativacao de `--delphi-actions`;
- leitura de `--route-path`;
- leitura de `--route-export-alias`;
- suporte a `--help` e `-h`;
- renderizacao compartilhada da mensagem de uso;
- integracao entre `gen:frontend` e a ajuda geral do pacote.

## Fonte unica da ajuda

A funcao publica:

```ts
renderFrontendCliUsage()
```

e usada pelo comando `generateFrontend.ts` e pela ajuda geral `showHelp.ts`.

Essa centralizacao evita que sintaxe, descricoes e exemplos sejam mantidos em locais diferentes.

A variante compacta pode ser produzida com:

```ts
renderFrontendCliUsage({ includeExample: false })
```

## Validadores

Os contratos estao organizados nos seguintes arquivos:

```text
src/cli/validateFrontendCliArgs.ts
src/cli/validateFrontendCliUsage.ts
src/cli/validateFrontendCliHelp.ts
src/cli/validateFrontendCliContracts.ts
```

O validador agregado verifica o parser, o renderer e a integracao entre os comandos.

Saida esperada do contrato agregado:

```text
FRONTEND_CLI_CONTRACTS_OK: checks=12: passed=12
```

## Comando de geracao documentado

```bash
pnpm --filter @gestor/delphi-parser gen:frontend produto.dfm produto.pas Produto PRODUTOS apps/frontend/src/modules/produtos --delphi-actions --route-path=/cadastros/produtos --route-export-alias=produtoRoute
```

## Estado de validacao

A presenca dos arquivos e sua persistencia no branch podem ser verificadas pelo GitHub. Compilacao TypeScript e execucao dos contratos precisam ser realizadas em ambiente com Node.js e dependencias do workspace instaladas.
