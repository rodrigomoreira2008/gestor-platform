# Parser PAS

## Objetivo

O parser PAS inicia a análise automática das units Pascal associadas aos formulários Delphi.

Ele complementa o parser DFM, que entende a estrutura visual, trazendo informações de comportamento e regra de negócio.

## Implementação inicial

A versão atual suporta:

- identificação de métodos `procedure`;
- identificação de métodos `function` com tipo de retorno;
- captura do corpo `begin ... end`;
- extração simples de SQL em `SQL.Text` e `CommandText`;
- extração de SQL por chamadas `SQL.Add(...)`;
- normalização inicial de strings SQL concatenadas com `+`, inclusive em múltiplas linhas;
- extração de mensagens em `ShowMessage`, `MessageDlg` e `Exception.Create`;
- heurística inicial para campos obrigatórios com `FieldByName(...).IsNull` e `.Text = ''`;
- extração inicial de componentes de dados como `TFDQuery`, `TQuery`, `TClientDataSet`, `TDataSource`, `TTable`, `TADOQuery`, `TADOTable`, `TIBQuery` e `TIBDataSet`.

## CLI

Executar análise de uma unit Pascal:

```bash
pnpm --filter @gestor/delphi-parser parse:pas caminho/para/CadastroProdutos.pas
```

A saída é um JSON contendo:

- `methods`;
- `sqlSnippets`;
- `validationHints`;
- `datasetHints`;
- `warnings`.

## Exemplo de saída

```json
{
  "methods": [
    {
      "kind": "procedure",
      "name": "BtnGravarClick",
      "body": "begin\n  ...\nend"
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
  ],
  "datasetHints": [
    {
      "name": "QryProdutos",
      "className": "TFDQuery",
      "tableName": "PRODUTOS"
    }
  ],
  "warnings": []
}
```

## Limitações conhecidas

Esta versão ainda não interpreta completamente a linguagem Pascal. Ela usa heurísticas textuais para acelerar a migração.

Limitações atuais:

- não resolve herança ou includes;
- não interpreta SQL montado por concatenação complexa com variáveis;
- não diferencia todos os tipos de validação;
- não faz análise semântica completa de variáveis;
- não resolve todos os relacionamentos entre datasets criados dinamicamente.

## Próximas melhorias

- detectar eventos vinculados aos componentes do DFM;
- mapear validações para campos da DSL;
- gerar relatório de lacunas;
- enriquecer automaticamente o `.gestor.json` gerado pelo parser DFM.
