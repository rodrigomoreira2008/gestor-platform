# Contrato de Módulo Gerado

## Objetivo

Definir o padrão mínimo que o gerador deve produzir para cada cadastro migrado do Delphi para React + .NET.

## Entrada

Cada módulo deve ser gerado a partir de:

- arquivo `.dfm`;
- arquivo `.pas` correspondente;
- DSL `.gestor.json`;
- metadados inferidos de tabelas, campos, validações e eventos.

## Backend gerado

Para cada entidade, o gerador deve produzir:

```text
apps/backend/
  Entities/<Entidade>.cs
  DTO/<Entidade>Dto.cs
  Validators/<Entidade>Validator.cs
  Services/<Entidade>Service.cs
  Controllers/<Entidade>Controller.cs
```

O controller deve herdar de:

```csharp
CrudControllerBase<TEntity, TDto, TService>
```

O service deve herdar de:

```csharp
CrudService<TEntity, TDto>
```

A entidade deve implementar:

```csharp
IEntity
```

O validator deve implementar:

```csharp
IValidator<TDto>
```

## Frontend gerado

Para cada entidade, o gerador deve produzir:

```text
apps/frontend/src/modules/<modulo>/
  api/<entidade>Api.ts
  hooks/use<Entidade>.ts
  pages/<Entidade>Page.tsx
  types/<entidade>.ts
  components/<Entidade>List.tsx
```

A API deve usar:

```ts
createCrudApi<TItem, TInput>()
```

O hook deve usar:

```ts
useCrudResource<TItem, TInput>()
```

A página deve usar a DSL renderizada por:

```tsx
<CrudPage />
```

## DSL

Cada módulo deve gerar um arquivo:

```text
examples/gestorloc/<entidade>.gestor.json
```

Esse arquivo precisa conter:

- entidade;
- título;
- origem `.dfm` e `.pas`;
- campos;
- seções;
- ações;
- validações inferidas;
- observações da migração.

## Critério de aceite

Um módulo gerado é considerado mínimo quando oferece:

- listagem;
- criação;
- edição;
- exclusão com confirmação;
- validação de campos obrigatórios;
- persistência via EF Core;
- rota no menu frontend;
- documentação de execução.
