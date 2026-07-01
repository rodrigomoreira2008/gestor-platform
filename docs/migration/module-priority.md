# Priorização dos Próximos Módulos

## Situação atual

O piloto `CadastroProdutos` já validou o primeiro fluxo funcional completo da migração Delphi para React + .NET.

## Ordem sugerida

### 1. Clientes

Motivo: módulo central do ERP, usado por pedidos, locações, contratos e financeiro.

### 2. Fornecedores

Motivo: estrutura semelhante a Clientes, útil para reaproveitar a base de pessoa/cadastro.

### 3. Pedidos

Motivo: módulo operacional importante, provavelmente envolve itens, totais e regras comerciais.

### 4. Orçamentos

Motivo: semelhante a pedidos, bom para validar fluxo comercial antes de contratos/locação.

### 5. Contas a Receber

Motivo: valida integração financeira e regras de baixa.

### 6. Contas a Pagar

Motivo: complementa financeiro e reaproveita padrões do contas a receber.

### 7. Locação / Contratos

Motivo: deve conter regras específicas do negócio e maior complexidade.

## Estratégia por módulo

Para cada módulo:

1. localizar `.dfm` e `.pas`;
2. gerar DSL;
3. gerar backend;
4. gerar frontend;
5. registrar menu;
6. testar CRUD;
7. documentar lacunas;
8. ajustar geradores.

## Observação

A cada novo módulo, o objetivo não é apenas migrar a tela, mas também melhorar os geradores para que o próximo módulo exija menos intervenção manual.
