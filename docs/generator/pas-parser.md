# Parser PAS

## Objetivo

O parser PAS inicia a análise automática das units Pascal associadas aos formulários Delphi.

Ele complementa o parser DFM, que entende a estrutura visual, trazendo informações de comportamento e regra de negócio.

## Implementação inicial

A primeira versão suporta:

- identificação de métodos `procedure`;
- captura do corpo `begin ... end`;
- extração simples de SQL em `SQL.Text` e `CommandText`;
- extração de mensagens em `ShowMessage`, `MessageDlg` e `Exception.Create`;
- heurística inicial para campos obrigatórios com `FieldByName(...).IsNull` e `.Text = ''`.

## CLI

Executar análise de uma unit Pascal:

```bash
pnpm --filter @gestor/delphi-parser parse:pas caminho/para/CadastroProdutos.pas
```

A saída é um JSON contendo:

- `methods`;
- `sqlSnippets`;
- `validationHints`;
- `warnings`.

## Exemplo de saída

```json
{
  "methods": [
    {
      "name": "BtnGravarClick",
      "body": "begin\n  ...\nend"
    }
  ],
  "sqlSnippets": [],
  "validationHints": [
    {
      "methodName": "BtnGravarClick",
      "field": "DESCRICAO",
      "message": "Descrição é obrigatória."
    }
  ],
  "warnings": []
}
```

## Limitações conhecidas

Esta versão ainda não interpreta completamente a linguagem Pascal. Ela usa heurísticas textuais para acelerar a migração.

Limitações atuais:

- não suporta `function` ainda;
- não resolve herança ou includes;
- não interpreta SQL montado por concatenação complexa;
- não diferencia todos os tipos de validação;
- não faz análise semântica completa de variáveis.

## Próximas melhorias

- suportar `function`;
- detectar eventos vinculados aos componentes do DFM;
- extrair `TDataSource`, `TFDQuery`, `TClientDataSet` e conexões de dataset;
- mapear validações para campos da DSL;
- gerar relatório de lacunas;
- enriquecer automaticamente o `.gestor.json` gerado pelo parser DFM.
