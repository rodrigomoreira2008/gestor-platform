# Validacao dinamica da pagina frontend

A validacao da pagina frontend executa o componente React gerado em um contexto isolado, com dependencias instrumentadas e sem acesso a rede, navegador ou sistema de arquivos.

## Comandos

Para um formulario:

```bash
pnpm --filter @gestor/delphi-parser validate:frontend-page arquivo.dfm arquivo.pas Entidade TABELA
```

Com relatorio JSON:

```bash
pnpm --filter @gestor/delphi-parser validate:frontend-page arquivo.dfm arquivo.pas Entidade TABELA -- --json
```

Para todos os fixtures:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-page
```

## Verificacoes

O executor confirma a existencia e a execucao do componente `<Entidade>Page`, percorre a arvore JSX retornada e verifica:

- container principal e arvore JSX valida;
- DataGrid configurado para listagem e selecao;
- dialogos de inclusao, alteracao e exclusao;
- botoes de edicao e exclusao com nomes acessiveis;
- hooks de listagem, criacao, alteracao e remocao;
- chamadas `create.mutate`, `update.mutate` e `remove.mutate`;
- componentes de detalhe quando inferidos do formulario Delphi;
- bloqueio de imports externos inesperados;
- limite de um segundo para inicializacao e renderizacao.

Em caso de sucesso, o comando emite um marcador no formato:

```text
FRONTEND_PAGE_OK:Produto:nodes=24:components=13
```

A etapa e executada no pipeline depois dos contratos de schema e antes da verificacao global das rotas.
