# Contratos agregados do CLI de frontend

Este documento descreve os contratos que protegem a interface de linha de comando usada para gerar frontend React/MUI a partir de formularios Delphi.

## Escopo

O fluxo cobre:

- leitura dos argumentos posicionais;
- ativacao de `--delphi-actions`;
- leitura de `--route-path` nas formas `--route-path=<valor>` e `--route-path <valor>`;
- leitura de `--route-export-alias` nas formas inline e separada;
- suporte a `--help` e `-h`;
- rejeicao de opcoes desconhecidas longas e curtas;
- rejeicao de opcoes nomeadas sem valor;
- rejeicao de valores separados compostos apenas por espacos ou tabulacoes;
- rejeicao de flags curtas ou longas usadas indevidamente como valor de outra opcao;
- rejeicao de `--delphi-actions`, `--route-path` e `--route-export-alias` informadas mais de uma vez;
- exigencia de `--delphi-actions` quando `--route-path` ou `--route-export-alias` sao usados;
- validacao de `--route-path` como caminho sem espacos, query string ou fragmento;
- validacao de `--route-export-alias` como identificador TypeScript nao reservado;
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

O validador agregado verifica:

- as duas sintaxes aceitas para opcoes nomeadas;
- os dois aliases de ajuda;
- mensagens exatas para valor ausente, valor em branco, opcao desconhecida e opcao duplicada;
- rejeicao de `-h` e `--delphi-actions` quando aparecem na posicao de valor;
- rejeicao de opcoes curtas desconhecidas, como `-x`;
- rejeicao de combinacoes duplicadas nas formas inline e separada;
- rejeicao de repeticao da flag booleana `--delphi-actions`;
- rejeicao de opcoes de rota sem `--delphi-actions`;
- preservacao do modo de ajuda mesmo quando uma opcao de rota acompanha `--help`;
- rejeicao de caminhos com espacos, query string ou fragmento;
- rejeicao de aliases com hifen ou iniciados por numero;
- rejeicao de palavras reservadas do TypeScript, como `default`, `class` e `await`;
- a ajuda completa e a variante sem exemplo;
- o consumo do renderer pelo gerador e pela ajuda geral;
- ausencia da antiga validacao duplicada em `generateFrontend.ts`.

Os arquivos `generateFrontend.ts` e `showHelp.ts` sao localizados a partir de `import.meta.url`, e nao de `process.cwd()`. Assim, o contrato nao depende de o processo ser iniciado dentro de `packages/delphi-parser`.

Saida esperada do contrato agregado:

```text
FRONTEND_CLI_CONTRACTS_OK: checks=42: passed=42
```

Saida esperada do contrato especifico do parser:

```text
FRONTEND_CLI_ARGS_OK: checks=32: passed=32
```

## Comando de geracao documentado

```bash
pnpm --filter @gestor/delphi-parser gen:frontend produto.dfm produto.pas Produto PRODUTOS apps/frontend/src/modules/produtos --delphi-actions --route-path=/cadastros/produtos --route-export-alias=produtoRoute
```

## Estado de validacao

A presenca dos arquivos e sua persistencia no branch podem ser verificadas pelo GitHub. Compilacao TypeScript e execucao dos contratos precisam ser realizadas em ambiente com Node.js e dependencias do workspace instaladas.
