namespace Gestor.Api.Common;

public abstract class CrudService<TEntity, TDto>
    where TEntity : class, IEntity
{
    private readonly CrudRepository<TEntity> _repository;
    private readonly IValidator<TDto>? _validator;

    protected CrudService(CrudRepository<TEntity> repository, IValidator<TDto>? validator = null)
    {
        _repository = repository;
        _validator = validator;
    }

    public async Task<IEnumerable<TDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(ToDto);
    }

    public async Task<TDto?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? default : ToDto(entity);
    }

    public async Task<TDto> CreateAsync(TDto input, CancellationToken cancellationToken)
    {
        EnsureValid(input);
        var entity = ToEntity(input);
        var created = await _repository.CreateAsync(entity, cancellationToken);
        return ToDto(created);
    }

    public async Task<bool> UpdateAsync(int id, TDto input, CancellationToken cancellationToken)
    {
        EnsureValid(input);
        var entity = ToEntity(input);
        entity.Id = id;
        return await _repository.UpdateAsync(entity, cancellationToken);
    }

    public Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        return _repository.DeleteAsync(id, cancellationToken);
    }

    protected abstract TDto ToDto(TEntity entity);
    protected abstract TEntity ToEntity(TDto dto);

    private void EnsureValid(TDto input)
    {
        if (_validator is null) return;

        var errors = _validator.Validate(input);
        if (errors.Count > 0) throw new InvalidOperationException(string.Join(" ", errors));
    }
}
