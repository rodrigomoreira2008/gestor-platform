# Backend: CRUD Genérico

## Objetivo

Reduzir código repetido na migração dos cadastros Delphi para API .NET.

Em vez de recriar manualmente controller, service e repository para cada cadastro, a plataforma usa uma base genérica reaproveitável.

## Componentes

### `IEntity`

Contrato mínimo para entidades persistidas:

```csharp
public interface IEntity
{
    int Id { get; set; }
}
```

### `IValidator<TDto>`

Contrato para validações específicas por módulo:

```csharp
public interface IValidator<in TDto>
{
    IReadOnlyList<string> Validate(TDto input);
}
```

### `CrudRepository<TEntity>`

Repository genérico baseado em Entity Framework Core.

Responsável por:

- listar;
- buscar por id;
- criar;
- atualizar;
- excluir.

### `CrudService<TEntity, TDto>`

Service genérico que centraliza o fluxo de CRUD e validação.

Cada módulo especializado implementa apenas o mapeamento:

```csharp
protected override TDto ToDto(TEntity entity);
protected override TEntity ToEntity(TDto dto);
```

### `CrudControllerBase<TEntity, TDto, TService>`

Controller base para endpoints REST:

```http
GET /api/recurso
GET /api/recurso/{id}
POST /api/recurso
PUT /api/recurso/{id}
DELETE /api/recurso/{id}
```

## Exemplo: Produto

O controller de Produto ficou reduzido a:

```csharp
[ApiController]
[Route("api/produtos")]
public class ProdutoController : CrudControllerBase<Produto, ProdutoDto, ProdutoService>
{
    public ProdutoController(ProdutoService service) : base(service)
    {
    }
}
```

O service de Produto herda de:

```csharp
CrudService<Produto, ProdutoDto>
```

E o validator implementa:

```csharp
IValidator<ProdutoDto>
```

## Benefício para a migração

Essa base prepara a plataforma para gerar rapidamente novos módulos como:

- Clientes;
- Fornecedores;
- Funcionários;
- Contratos;
- Contas a pagar;
- Contas a receber;
- Estoque;
- Locação.

Para cada novo cadastro, o gerador precisará criar principalmente:

- entidade;
- DTO;
- validator;
- service com mapeamento;
- controller mínimo;
- configuração no DbContext.

Isso reduz drasticamente o volume de código gerado por módulo e facilita manutenção futura.
