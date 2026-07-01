using Gestor.Api.Common;
using Gestor.Api.DTO;
using Gestor.Api.Entities;
using Gestor.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Gestor.Api.Controllers;

[ApiController]
[Route("api/produtos")]
public class ProdutoController : CrudControllerBase<Produto, ProdutoDto, ProdutoService>
{
    public ProdutoController(ProdutoService service) : base(service)
    {
    }
}
