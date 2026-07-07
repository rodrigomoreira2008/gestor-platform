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
- extração inicial de componentes de dados como `TFDQuery`, `TQuery`, `TClientDataSet`, `TDataSource`, `TTable`, `TADOQuery`, `TADOTable`, `TIBQuery` e `TIBDataSet`;
- extração inicial de eventos por atribuição (`Componente.OnClick := Handler`) e por convenção de nome (`BotaoClick`, `CampoExit`, etc.).

## CLI

Executar análise de uma unit Pascal:

```bash
pnpm --filter @gestor/delphi-parser parse:pas caminho/para/CadastroProdutos.pas
```

Validar todos os artefatos gerados a partir de um par DFM/PAS:

```bash
pnpm --filter @gestor/delphi-parser validate:generated arquivo.dfm arquivo.pas Entidade tabela
```

A validação unificada gera backend e frontend em memória, verifica paths duplicados, arquivos vazios e retorna um resumo de campos, ações, lookups, abas e grids detalhe.

A saída do parser é um JSON contendo:

- `methods`;
- `sqlSnippets`;
- `validationHints`;
- `datasetHints`;
- `eventHints`;
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
  "eventHints": [
    {
      "componentName": "BtnGravar",
      "eventName": "OnClick",
      "handlerName": "BtnGravarClick"
    }
  ],
  "warnings": []
}
```

## Eventos

O parser detecta eventos de duas formas:

1. Atribuições explícitas no código:

```pascal
BtnGravar.OnClick := BtnGravarClick;
```

2. Convenções comuns do Delphi:

```pascal
procedure TForm.BtnGravarClick(Sender: TObject);
procedure TForm.CampoDescricaoExit(Sender: TObject);
```

Essas pistas ajudam a conectar ações da DSL aos métodos encontrados no PAS.

## Validação de artefatos

Os comandos de validação atuais são:

```bash
pnpm --filter @gestor/delphi-parser validate:backend arquivo.dfm arquivo.pas Entidade tabela
pnpm --filter @gestor/delphi-parser validate:frontend arquivo.dfm arquivo.pas Entidade tabela
pnpm --filter @gestor/delphi-parser validate:generated arquivo.dfm arquivo.pas Entidade tabela
```

Eles foram criados para funcionar como uma checagem rápida antes de copiar artefatos para as aplicações reais.

## Limitações conhecidas

Esta versão ainda não interpreta completamente a linguagem Pascal. Ela usa heurísticas textuais para acelerar a migração.

Limitações atuais:

- não resolve herança ou includes;
- não interpreta SQL montado por concatenação complexa com variáveis;
- não diferencia todos os tipos de validação;
- não faz análise semântica completa de variáveis;
- não resolve todos os relacionamentos entre datasets criados dinamicamente.

## Próximas melhorias

- criar fixtures reais de DFM/PAS para validar regressão;
- gerar relatório de lacunas por módulo;
- enriquecer automaticamente o `.gestor.json` gerado pelo parser DFM;
- transformar validações rápidas em testes automatizados no pipeline.
