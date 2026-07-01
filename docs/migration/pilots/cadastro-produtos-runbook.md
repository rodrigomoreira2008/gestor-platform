# Runbook do Piloto: CadastroProdutos

## Objetivo

Executar localmente o primeiro fluxo funcional do GestorLoc migrado para React + .NET.

## Backend

```bash
dotnet run --project apps/backend/Gestor.Api.csproj --urls http://0.0.0.0:5000
```

Validar saúde da API:

```bash
curl http://localhost:5000/health
```

Validar listagem de produtos:

```bash
curl http://localhost:5000/api/produtos
```

## Banco local

O piloto usa Entity Framework Core com SQLite.

Ao iniciar a API, o arquivo abaixo é criado automaticamente se ainda não existir:

```text
gestor.db
```

Os produtos cadastrados permanecem após reiniciar o backend. Para reiniciar a base local, pare a API e remova o arquivo `gestor.db`.

## Frontend

```bash
pnpm --filter @gestor/frontend dev
```

Acessar:

```text
http://localhost:5173
```

No menu lateral, abrir:

```text
Produtos
```

## Fluxo de teste manual

1. Abrir a tela Produtos.
2. Clicar em `Novo`.
3. Preencher os campos obrigatórios:
   - Descrição
   - Marca
   - Grupo
   - Valor Estimado
   - Unidade
   - Tipo de Locação
   - Locação
4. Clicar em `Gravar`.
5. Confirmar mensagem de sucesso.
6. Confirmar que a contagem de produtos carregados aumenta.
7. Confirmar que o produto aparece na lista `Produtos cadastrados`.
8. Reiniciar o backend e confirmar que o produto continua listado.

## Edição

1. Clicar em `Editar` na linha de um produto.
2. Confirmar que os dados aparecem no formulário.
3. Alterar algum campo.
4. Clicar em `Gravar`.
5. Confirmar que a lista foi atualizada.

## Exclusão

1. Clicar em `Excluir` na linha de um produto.
2. Confirmar mensagem de sucesso.
3. Confirmar que o item saiu da lista.

## Validação de erro

Para validar a regra de obrigatoriedade:

1. Clicar em `Novo`.
2. Deixar campos obrigatórios vazios.
3. Clicar em `Gravar`.
4. A tela deve exibir a mensagem retornada pela API.

## Observações

Este piloto já usa persistência local com SQLite e CRUD básico na interface. A próxima evolução será criar migrations formais do Entity Framework e adicionar confirmação antes da exclusão.
