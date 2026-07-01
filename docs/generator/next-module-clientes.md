# Próximo Módulo Piloto: Clientes

## Objetivo

Usar o cadastro de clientes como segundo piloto funcional após Produto.

Produto validou a base técnica:

- DSL;
- React;
- CRUD genérico frontend;
- CRUD genérico backend;
- EF Core + SQLite;
- validação;
- documentação de execução.

Clientes deve validar casos mais próximos do uso diário do ERP.

## Por que Clientes

O cadastro de clientes normalmente envolve:

- dados cadastrais;
- CPF/CNPJ;
- endereço;
- contato;
- situação cadastral;
- regras de validação;
- vínculos com pedidos, contratos, locações e financeiro.

Isso ajuda a testar relacionamentos e regras mais amplas que Produto.

## Artefatos esperados

### Backend

```text
Entities/Cliente.cs
DTO/ClienteDto.cs
Validators/ClienteValidator.cs
Services/ClienteService.cs
Controllers/ClienteController.cs
```

### Frontend

```text
modules/clientes/types/cliente.ts
modules/clientes/api/clienteApi.ts
modules/clientes/hooks/useClientes.ts
modules/clientes/components/ClienteList.tsx
modules/clientes/pages/CadastroClientesPage.tsx
```

### DSL

```text
examples/gestorloc/cadastro-clientes.gestor.json
```

## Estratégia

1. Localizar `CadastroClientes.dfm` e `CadastroClientes.pas` no projeto Delphi.
2. Gerar inventário específico do formulário.
3. Extrair campos, seções, datasets e eventos.
4. Gerar DSL.
5. Gerar backend usando CRUD genérico.
6. Gerar frontend usando CRUD genérico.
7. Registrar rota/menu.
8. Criar runbook.

## Critério de aceite

O módulo Clientes estará aceito quando permitir:

- cadastrar cliente;
- editar cliente;
- excluir cliente com confirmação;
- listar clientes;
- validar campos obrigatórios;
- persistir em SQLite;
- reiniciar backend sem perder dados.
