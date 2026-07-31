# Validação de complexidade do frontend gerado

O executor `validateGeneratedFrontendComplexity.ts` mede o tamanho e a complexidade estrutural dos arquivos TypeScript e TSX produzidos para cada formulário Delphi.

## Execução individual

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendComplexity.ts \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para obter o relatório completo:

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendComplexity.ts \
  arquivo.dfm arquivo.pas Entidade TABELA --json
```

## Métricas

Para cada arquivo `.ts` e `.tsx`, o contrato registra:

- quantidade de linhas;
- tamanho em bytes UTF-8;
- número de imports;
- número de funções e callbacks;
- quantidade de elementos JSX;
- profundidade máxima da AST.

Também é verificado o tamanho total do módulo gerado.

## Limites

Os limites atuais são deliberadamente conservadores para detectar crescimento acidental sem impedir formulários reais:

```text
450 linhas por arquivo
40.000 bytes por arquivo
24 imports por arquivo
24 funções por arquivo
120 elementos JSX por arquivo
18 níveis de profundidade
220.000 bytes no módulo completo
```

Uma ultrapassagem gera diagnóstico com o arquivo, a métrica observada e o limite esperado.

## Marcador de sucesso

```text
FRONTEND_COMPLEXITY_OK:Produto:files=16:bytes=28400:largest=9100
```

## Integração

O contrato `complexity` faz parte de `validate:fixture-frontend-tabbed-form`. Portanto, ele é executado para os cinco fixtures pelo `validate:all` e pelo GitHub Actions.
