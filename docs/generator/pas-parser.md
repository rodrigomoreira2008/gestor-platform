# Parser PAS

## Objetivo

O parser PAS inicia a analise automatica das units Pascal associadas aos formularios Delphi.

Ele complementa o parser DFM, que entende a estrutura visual, trazendo informacoes de comportamento e regra de negocio.

## Implementacao inicial

A versao atual suporta:

- identificacao de metodos `procedure`;
- identificacao de metodos `function` com tipo de retorno;
- captura do corpo `begin ... end`;
- extracao simples de SQL em `SQL.Text` e `CommandText`;
- extracao de SQL por chamadas `SQL.Add(...)`;
- normalizacao inicial de strings SQL concatenadas com `+`, inclusive em multiplas linhas;
- extracao de mensagens em `ShowMessage`, `MessageDlg` e `Exception.Create`;
- heuristica inicial para campos obrigatorios com `FieldByName(...).IsNull` e `.Text = ''`;
- extracao inicial de componentes de dados como `TFDQuery`, `TQuery`, `TClientDataSet`, `TDataSource`, `TTable`, `TADOQuery`, `TADOTable`, `TIBQuery` e `TIBDataSet`;
- extracao inicial de eventos por atribuicao (`Componente.OnClick := Handler`) e por convencao de nome (`BotaoClick`, `CampoExit`, etc.).

## CLI

Executar analise de uma unit Pascal:

```bash
pnpm --filter @gestor/delphi-parser parse:pas caminho/para/CadastroProdutos.pas
```

Validar todos os artefatos gerados a partir de um par DFM/PAS:

```bash
pnpm --filter @gestor/delphi-parser validate:generated arquivo.dfm arquivo.pas Entidade tabela
pnpm --filter @gestor/delphi-parser validate:fixture:produtos
pnpm --filter @gestor/delphi-parser validate:fixture:parceiros
```

A validacao unificada gera backend e frontend em memoria, verifica paths duplicados, arquivos vazios e retorna um resumo de campos, acoes, lookups, abas e grids detalhe.

## Fixtures

A pasta fixtures inclui cenarios iniciais de migracao:

- Cadastro de Produtos: abas, lookup de grupo, checkbox, grid de movimentos, SQL com join e SQL de detalhe por produto;
- Cadastro de Parceiros: abas, lookup de grupo, checkbox, grid de enderecos, SQL com join e SQL de detalhe por parceiro.

## Validacao de artefatos

Os comandos de validacao atuais sao:

```bash
pnpm --filter @gestor/delphi-parser validate:backend arquivo.dfm arquivo.pas Entidade tabela
pnpm --filter @gestor/delphi-parser validate:frontend arquivo.dfm arquivo.pas Entidade tabela
pnpm --filter @gestor/delphi-parser validate:generated arquivo.dfm arquivo.pas Entidade tabela
pnpm --filter @gestor/delphi-parser validate:fixture:produtos
pnpm --filter @gestor/delphi-parser validate:fixture:parceiros
```

Eles foram criados para funcionar como uma checagem rapida antes de copiar artefatos para as aplicacoes reais.

## Limitacoes conhecidas

Esta versao ainda nao interpreta completamente a linguagem Pascal. Ela usa heuristicas textuais para acelerar a migracao.

Limitacoes atuais:

- nao resolve heranca ou includes;
- nao interpreta SQL montado por concatenacao complexa com variaveis;
- nao diferencia todos os tipos de validacao;
- nao faz analise semantica completa de variaveis;
- nao resolve todos os relacionamentos entre datasets criados dinamicamente.

## Proximas melhorias

- adicionar mais fixtures reais por modulo;
- gerar relatorio de lacunas por modulo;
- enriquecer automaticamente o `.gestor.json` gerado pelo parser DFM;
- transformar validacoes rapidas em testes automatizados no pipeline.
