# Piloto de Migração: CadastroProdutos

## Origem

- `CadastroProdutos.dfm`
- `CadastroProdutos.pas`

## Objetivo

Usar o cadastro de produtos do GestorLoc como primeiro piloto funcional real para validar a migração Delphi → React + .NET.

## Artefatos criados

### Frontend/DSL

- `examples/gestorloc/cadastro-produtos.gestor.json`
- `examples/gestorloc/CadastroProdutosPage.tsx`

### Backend

- `apps/backend/Entities/Produto.cs`
- `apps/backend/DTO/ProdutoDto.cs`
- `apps/backend/Validators/ProdutoValidator.cs`
- `apps/backend/Repositories/ProdutoRepository.cs`
- `apps/backend/Services/ProdutoService.cs`
- `apps/backend/Controllers/ProdutoController.cs`

## Seções da tela

A primeira DSL do módulo já representa agrupamentos vindos do formulário Delphi:

- Dados Gerais
- Valores
- Unidade e Quantidades
- Valores Para Locação
- Dados Adicionais

## Validações inferidas

Foram inferidos campos obrigatórios a partir do código Pascal:

- Descrição
- Marca
- Grupo
- Valor estimado
- Unidade
- Tipo de locação
- Locação

## Endpoint inicial

```http
GET /api/produtos
GET /api/produtos/{id}
POST /api/produtos
PUT /api/produtos/{id}
DELETE /api/produtos/{id}
```

## Observações

Esta ainda é uma primeira versão piloto. O repository usa memória em vez de banco real. A próxima etapa será conectar esse módulo ao modelo de persistência definitivo e evoluir o parser para gerar esses arquivos automaticamente.
