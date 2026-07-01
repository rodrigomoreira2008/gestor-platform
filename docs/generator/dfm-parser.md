# Parser DFM

## Objetivo

O pacote `@gestor/delphi-parser` inicia a leitura automática dos formulários Delphi `.dfm` para alimentar o pipeline de migração.

## Implementação inicial

A primeira versão suporta:

- leitura de blocos `object ... end`;
- montagem de árvore de componentes;
- captura de propriedades simples;
- identificação de campos de entrada;
- identificação de botões;
- inferência de seção por `TGroupBox`, `TTabSheet` ou `TPanel`.

## Componentes reconhecidos inicialmente

### Campos

- `TDBEdit`
- `TDBComboBox`
- `TDBMemo`
- `TDBGrid`
- `TEdit`
- `TComboBox`
- `TMemo`
- `TMaskEdit`

### Ações

- `TBitBtn`
- `TSpeedButton`
- `TButton`

### Seções

- `TGroupBox`
- `TTabSheet`
- `TPanel`

## CLI

Executar parser em um DFM textual:

```bash
pnpm --filter @gestor/delphi-parser parse:dfm caminho/para/CadastroProdutos.dfm
```

A saída é um JSON com:

- dados do formulário;
- avisos;
- campos encontrados;
- ações encontradas.

## Próximas melhorias

- associar labels próximos aos campos;
- suportar propriedades multilinha;
- tratar coleções Delphi;
- reconhecer `TPageControl`/abas com mais precisão;
- exportar DSL `.gestor.json` diretamente;
- integrar com analisador PAS.
