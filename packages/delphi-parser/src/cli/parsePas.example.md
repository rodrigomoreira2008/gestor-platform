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

  Query.SQL.Text := 'select * from produtos';
end;
```

## Saída esperada

```json
{
  "methods": [
    {
      "name": "BtnGravarClick"
    }
  ],
  "sqlSnippets": [
    {
      "methodName": "BtnGravarClick",
      "text": "select * from produtos"
    }
  ],
  "validationHints": [
    {
      "methodName": "BtnGravarClick",
      "field": "DESCRICAO",
      "message": "Descrição é obrigatória."
    }
  ]
}
```
