# Runbook do Piloto: CadastroClientes

## Objetivo

Executar localmente o segundo fluxo funcional migrado do GestorLoc: cadastro de clientes em React + .NET.

## Backend

```bash
dotnet run --project apps/backend/Gestor.Api.csproj --urls http://0.0.0.0:5000
```

Validar saúde da API:

```bash
curl http://localhost:5000/health
```

Validar listagem de clientes:

```bash
curl http://localhost:5000/api/clientes
```

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
Clientes
```

## Fluxo de teste manual

1. Abrir a tela Clientes.
2. Clicar em `Novo`.
3. Preencher os campos obrigatórios:
   - Nome / Razão Social
   - CPF/CNPJ
   - Cidade
   - UF
4. Clicar em `Gravar`.
5. Confirmar mensagem de sucesso.
6. Confirmar que o cliente aparece na lista `Clientes cadastrados`.
7. Reiniciar o backend e confirmar que o cliente continua listado.

## Edição

1. Clicar em `Editar` na linha de um cliente.
2. Confirmar que os dados aparecem no formulário.
3. Alterar algum campo.
4. Clicar em `Gravar`.
5. Confirmar que a lista foi atualizada.

## Exclusão

1. Clicar em `Excluir` na linha de um cliente.
2. Confirmar a exclusão no diálogo.
3. Confirmar mensagem de sucesso.
4. Confirmar que o item saiu da lista.

## Observações

Esta é a primeira versão funcional do módulo Clientes usando a mesma arquitetura genérica validada em Produto. A DSL ainda deve ser refinada com extração direta do DFM/PAS real.
