# Inventário Inicial do GestorLoc

Inventário gerado a partir do arquivo `GestorLoc.rar` disponibilizado na conversa.

## Resumo

| Tipo | Quantidade |
|---|---:|
| Total de arquivos | 1958 |
| Units Delphi `.pas` | 778 |
| Formulários `.dfm` | 674 |
| Bitmaps `.bmp` | 250 |
| PNG `.png` | 142 |
| Relatórios FastReport `.fr3` | 12 |
| Projeto Delphi `.dpr` | 1 |
| Projeto Delphi `.dproj` | 1 |

## DataModules identificados

Foram encontrados 4 candidatos a DataModule:

- `BaseConsulta.pas`
- `BaseDados.pas`
- `Boleto.pas`
- `Boletos/FC/Laz/ACBrBoletoFCLazReportDm.pas`

## Componentes mais frequentes nos DFM

| Componente | Ocorrências |
|---|---:|
| `TStringField` | 10853 |
| `TQRLabel` | 5409 |
| `TQRDBText` | 4356 |
| `TIntegerField` | 4256 |
| `TFloatField` | 3978 |
| `TLabel` | 3725 |
| `TQRShape` | 2135 |
| `TDBEdit` | 2061 |
| `TBitBtn` | 1866 |
| `TDateField` | 1687 |
| `TFDQuery` | 1617 |
| `TfrxMemoView` | 1502 |
| `TPanel` | 1187 |
| `TQRBand` | 954 |
| `TEdit` | 906 |
| `TGroupBox` | 905 |
| `TRLLabel` | 891 |
| `TQRExpr` | 670 |
| `TDataSource` | 555 |
| `TSpeedButton` | 437 |
| `TMaskEdit` | 435 |
| `TMenuItem` | 371 |
| `TDBGrid` | 323 |
| `TDBComboBox` | 301 |
| `TRadioGroup` | 300 |
| `TDBMemo` | 118 |
| `TComboBox` | 96 |
| `TQuickRep` | 192 |

## Bibliotecas e tecnologias detectadas

| Tecnologia / biblioteca | Evidência |
|---|---|
| FireDAC | muitas units usam `FireDAC.*`, e há 1617 componentes `TFDQuery` |
| QuickReport | componentes `TQuickRep`, `TQRLabel`, `TQRDBText`, `TQRBand` |
| FastReport | arquivos `.fr3` e componentes `Tfrx*` |
| FortesReport | componentes `TRLLabel`, `TRLDraw` e referências `RLReport` |
| ACBr | 108 arquivos com nomes `ACBr*` e diversas referências no código |
| JVCL | referências pontuais a `TJv*` |

## Arquivos com maior concentração aparente de SQL

| Arquivo | Pontuação aproximada SQL |
|---|---:|
| `SelRelTabelaPrecoLocacao.pas` | 225 |
| `Unit_ComandosSQL.pas` | 210 |
| `CadastroProdutos.pas` | 185 |
| `SelRelHistoricoLocacao.pas` | 156 |
| `CadastroBaixaContasReceber.pas` | 126 |
| `CadastroBaixaContasPagar.pas` | 92 |
| `CadastroDevolucao.pas` | 87 |
| `OpcoesLocacao.pas` | 66 |
| `CadastroPedidos.pas` | 51 |
| `CadastroOrcamento.pas` | 46 |

## Candidatos simples para piloto técnico

Estes formulários têm baixa quantidade de componentes e podem ser bons para validar o pipeline inicial:

- `CadastroDadosRecibo.dfm`
- `OpcaoChequeBaixaContasPagar.dfm`
- `OpcaoChequeBaixaContasReceber.dfm`
- `OpcaoListagemContasPagar.dfm`
- `OpcaoListagemContasReceber.dfm`
- `OpcoesImprimirFatura.dfm`
- `AmpliaImagem.dfm`
- `AmpliaImagemProduto.dfm`

## Candidatos funcionais para piloto de valor

Apesar de mais complexos, estes módulos parecem mais relevantes para validar a migração real do ERP:

- `CadastroProdutos.pas/.dfm`
- `CadastroPedidos.pas/.dfm`
- `CadastroOrcamento.pas/.dfm`
- `CadastroBaixaContasReceber.pas/.dfm`
- `CadastroBaixaContasPagar.pas/.dfm`

## Decisão recomendada

Usar dois pilotos em sequência:

1. **Piloto técnico simples**: formulário pequeno para validar parser, DSL, React e API.
2. **Piloto funcional real**: `CadastroProdutos`, pois aparece como um dos módulos com mais regras/SQL e deve representar bem a complexidade do GestorLoc.

## Próximos passos

1. Melhorar o parser DFM para os componentes mais frequentes.
2. Criar conversão inicial para um formulário simples.
3. Criar conversão inicial para `CadastroProdutos`.
4. Medir lacunas do parser e do gerador a partir do código real.
