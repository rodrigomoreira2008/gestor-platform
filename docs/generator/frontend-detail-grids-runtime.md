# Validação dinâmica dos grids de detalhe frontend

O executor `validateGeneratedFrontendDetailGrids.ts` valida as definições e os componentes React gerados para grids mestre-detalhe.

## Execução individual

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendDetailGrids.ts \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para saída JSON, acrescente `--json`.

## Execução nos fixtures

A validação faz parte da suíte agregada:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-tabbed-form
```

Essa suíte executa, para cada fixture, os contratos de formulário com abas, filtros avançados e grids de detalhe.

## Contratos verificados

O executor confirma:

- correspondência entre os grids inferidos e o arquivo de definições;
- exports esperados e metadados obrigatórios;
- execução real de cada componente React gerado;
- renderização do `DataGrid` e da barra de ferramentas;
- propagação dos estados de carregamento e erro;
- preservação de identificadores naturais;
- geração determinística de identificadores sintéticos;
- habilitação do filtro rápido;
- suporte correto a formulários sem grids inferidos;
- bloqueio de módulos externos inesperados;
- limite de execução em ambiente isolado.

## Marcador de sucesso

Uma execução válida produz um marcador semelhante a:

```text
FRONTEND_DETAIL_GRIDS_OK:Pedido:grids=1:components=1
```

Qualquer divergência de definição, renderização ou comportamento encerra o processo com código diferente de zero.

## Pipeline

A suíte agregada é executada no `validate:all` e no GitHub Actions depois dos demais contratos dinâmicos do frontend e antes da validação global das rotas.
