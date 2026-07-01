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
- inferência de seção por `TGroupBox`, `TTabSheet` ou `TPanel`;
- leitura de posição/tamanho (`Left`, `Top`, `Width`, `Height`);
- associação inicial de labels por proximidade visual com `TLabel`.

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

### Labels

- `TLabel`

### Seções

- `TGroupBox`
- `TTabSheet`
- `TPanel`

## Associação de labels

Quando um campo não possui `Caption`, o parser tenta encontrar um `TLabel` próximo no mesmo componente pai.

A heurística atual considera labels:

- acima do campo;
- próximos verticalmente;
- alinhados à esquerda do campo.

Essa regra ainda é simples, mas já ajuda a converter muitos formulários Delphi típicos, onde o `TLabel` fica logo acima ou próximo do `TDBEdit`.

## CLI

Executar parser em um DFM textual:

```bash
pnpm --filter @gestor/delphi-parser parse:dfm caminho/para/CadastroProdutos.dfm
```

A saída é um JSON com:

- dados do formulário;
- avisos;
- campos encontrados;
- ações encontradas;
- seção inferida;
- bounds dos componentes;
- label inferido quando possível.

## Próximas melhorias

- suportar propriedades multilinha;
- tratar coleções Delphi;
- reconhecer `TPageControl`/abas com mais precisão;
- exportar DSL `.gestor.json` diretamente;
- integrar com analisador PAS;
- adicionar testes automatizados com amostras reais de DFM.
