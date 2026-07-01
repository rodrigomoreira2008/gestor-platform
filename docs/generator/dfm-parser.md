# Parser DFM

## Objetivo

O pacote `@gestor/delphi-parser` inicia a leitura automática dos formulários Delphi `.dfm` para alimentar o pipeline de migração.

## Implementação inicial

A versão atual suporta:

- leitura de blocos `object ... end`;
- montagem de árvore de componentes;
- captura de propriedades simples;
- captura inicial de propriedades multilinha;
- leitura de listas `(...)`, coleções `<...>` e blobs `{...}` como texto preservado;
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

## Propriedades multilinha

O parser já reconhece propriedades iniciadas por:

```text
(
<
{
```

Isso cobre casos comuns como:

- `Items.Strings = (...)`
- `Columns = <...>`
- blobs binários/textuais representados entre `{...}`

Nesta fase, coleções e blobs ainda são preservados como texto. A interpretação semântica virá em uma etapa posterior.

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

- tratar coleções Delphi semanticamente;
- reconhecer `TPageControl`/abas com mais precisão;
- exportar DSL `.gestor.json` diretamente;
- integrar com analisador PAS;
- adicionar testes automatizados com amostras reais de DFM.
