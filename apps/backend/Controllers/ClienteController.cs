using Gestor.Api.Common;
using Gestor.Api.DTO;
using Gestor.Api.Entities;
using Gestor.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Gestor.Api.Controllers;

[ApiController]
[Route("api/clientes")]
public class ClienteController : CrudControllerBase<Cliente, ClienteDto, ClienteService>
{
    public ClienteController(ClienteService service) : base(service)
    {
    }
}
