# Validação dinâmica dos lookups frontend

A validação dinâmica dos componentes de lookup executa o TSX gerado em um contexto isolado do Node, com React, Material UI e hooks de consulta substituídos por implementações instrumentadas.

## Comando individual

```bash
pnpm --filter @gestor/delphi-parser validate:frontend-lookup \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para obter o relatório estruturado:

```bash
pnpm --filter @gestor/delphi-parser validate:frontend-lookup \
  arquivo.dfm arquivo.pas Entidade TABELA -- --json
```

## Todos os fixtures

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-lookup
```

## Contratos verificados

A validação confirma:

- exportação do componente `<Entidade>LookupField`;
- execução dos hooks associados aos lookups inferidos;
- renderização de `Autocomplete` para campos conhecidos;
- encaminhamento das opções e do valor selecionado;
- equivalência entre identificadores numéricos e textuais;
- propagação dos estados de carregamento;
- execução de `getOptionLabel`, `onChange` e `renderInput`;
- presença do indicador de carregamento;
- fallback desabilitado para campos não inferidos;
- bloqueio de dependências externas inesperadas;
- limite de um segundo para inicialização e execução do módulo.

O sucesso é indicado por um marcador semelhante a:

```text
FRONTEND_LOOKUP_OK:Produto:lookups=2:autocomplete=2
```

## Pipeline

O teste roda depois da validação do formulário com abas e antes da validação global das rotas, tanto no `validate:all` quanto no GitHub Actions.
