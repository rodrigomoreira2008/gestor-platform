using Gestor.Api.Common;
using Gestor.Api.DTO;
using Gestor.Api.Entities;
using Gestor.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Gestor.Api.Controllers;

[ApiController]
[Route("api/fornecedores")]
public class FornecedorController : CrudControllerBase<Fornecedor, FornecedorDto, FornecedorService>
{
    public FornecedorController(FornecedorService service) : base(service)
    {
    }
}
