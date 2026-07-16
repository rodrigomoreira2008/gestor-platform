# Validação dinâmica dos filtros frontend

O executor `validateGeneratedFrontendFilters.ts` carrega as definições e o componente React de filtros gerados em um contexto isolado do Node.

## Execução individual

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendFilters.ts \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para emitir JSON, acrescente `--json` ao final.

## Execução nos fixtures

A suíte agregada existente executa os contratos do formulário com abas e dos filtros para os cinco fixtures:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-tabbed-form
```

O comando produz dez execuções isoladas: dois contratos para cada um dos cinco fixtures. Uma falha não impede que os demais casos sejam executados, mas o processo termina com código diferente de zero quando qualquer contrato falha.

## Contratos verificados

A validação confirma:

- exports das definições e do componente;
- raiz semântica configurada como seção de filtros;
- nome acessível `Filtros avançados`;
- quantidade de controles coerente com as definições inferidas;
- renderização de `TextField` e `Select`;
- botões Aplicar filtros e Limpar;
- aplicação pelo botão e pela tecla Enter;
- remoção de valores vazios, nulos e indefinidos;
- preservação de números e booleanos válidos;
- limpeza do estado e chamada de `onChange({})`;
- bloqueio de imports não autorizados;
- limite de execução de um segundo.

## Marcador de sucesso

```text
FRONTEND_FILTERS_OK:Produto:controls=4:changes=3
```

A suíte agregada faz parte do `validate:all` e do workflow `delphi-fixtures.yml`, imediatamente antes das validações de lookup e rotas.
