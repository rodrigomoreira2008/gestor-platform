# Exemplo: parse:pas

Este arquivo documenta uma amostra mínima para validar manualmente o parser PAS.

## Entrada

```pascal
procedure TCadastroProdutos.BtnGravarClick(Sender: TObject);
begin
  if Query.FieldByName('DESCRICAO').IsNull then
  begin
    ShowMessage('Descrição é obrigatória.');
    Exit;
  end;

  Query.SQL.Text := 'select * ' +
    'from produtos';
  Query.SQL.Add('where ativo = 1');
end;

function TCadastroProdutos.PodeGravar: Boolean;
begin
  Result := True;
end;

var
  QryProdutos: TFDQuery;
  DsProdutos: TDataSource;
begin
  QryProdutos.TableName := 'PRODUTOS';
  DsProdutos.DataSet := QryProdutos;
  BtnGravar.OnClick := BtnGravarClick;
end;
```

## Saída esperada

```json
{
  "methods": [
    {
      "kind": "procedure",
      "name": "BtnGravarClick"
    },
    {
      "kind": "function",
      "name": "PodeGravar",
      "returnType": "Boolean"
    }
  ],
  "sqlSnippets": [
    {
      "methodName": "BtnGravarClick",
      "text": "select * from produtos"
    },
    {
      "methodName": "BtnGravarClick",
      "text": "where ativo = 1"
    }
  ],
  "validationHints": [
    {
      "methodName": "BtnGravarClick",
      "field": "DESCRICAO",
      "message": "Descrição é obrigatória."
    }
  ],
  "datasetHints": [
    {
      "name": "QryProdutos",
      "className": "TFDQuery",
      "tableName": "PRODUTOS"
    },
    {
      "name": "DsProdutos",
      "className": "TDataSource",
      "dataSource": "QryProdutos"
    }
  ],
  "eventHints": [
    {
      "componentName": "BtnGravar",
      "eventName": "OnClick",
      "handlerName": "BtnGravarClick"
    }
  ]
}
```

## Observação

O parser já reconhece concatenação de strings SQL em múltiplas linhas quando a expressão usa literais Pascal unidos por `+`.
