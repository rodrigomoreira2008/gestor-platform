using Microsoft.AspNetCore.Mvc;

namespace Gestor.Api.Common;

public abstract class CrudControllerBase<TEntity, TDto, TService> : ControllerBase
    where TEntity : class, IEntity
    where TService : CrudService<TEntity, TDto>
{
    protected CrudControllerBase(TService service)
    {
        Service = service;
    }

    protected TService Service { get; }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TDto>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await Service.GetAllAsync(cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await Service.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<TDto>> Create(TDto input, CancellationToken cancellationToken)
    {
        try
        {
            var created = await Service.CreateAsync(input, cancellationToken);
            return Created(string.Empty, created);
        }
        catch (InvalidOperationException error)
        {
            return BadRequest(new { error = error.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, TDto input, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await Service.UpdateAsync(id, input, cancellationToken);
            return updated ? NoContent() : NotFound();
        }
        catch (InvalidOperationException error)
        {
            return BadRequest(new { error = error.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await Service.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
