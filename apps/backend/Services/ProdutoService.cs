using Gestor.Api.DTO;
using Gestor.Api.Repositories;
using Gestor.Api.Validators;

namespace Gestor.Api.Services;

public class ProdutoService
{
    private readonly ProdutoRepository _repository;
    private readonly ProdutoValidator _validator;

    public ProdutoService(ProdutoRepository repository, ProdutoValidator validator)
    {
        _repository = repository;
        _validator = validator;
    }

    public Task<IEnumerable<ProdutoDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return _repository.GetAllAsync(cancellationToken);
    }

    public Task<ProdutoDto?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return _repository.GetByIdAsync(id, cancellationToken);
    }

    public Task<ProdutoDto> CreateAsync(ProdutoDto input, CancellationToken cancellationToken)
    {
        EnsureValid(input);
        return _repository.CreateAsync(input, cancellationToken);
    }

    public Task UpdateAsync(int id, ProdutoDto input, CancellationToken cancellationToken)
    {
        input.Id = id;
        EnsureValid(input);
        return _repository.UpdateAsync(input, cancellationToken);
    }

    public Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        return _repository.DeleteAsync(id, cancellationToken);
    }

    private void EnsureValid(ProdutoDto input)
    {
        var errors = _validator.Validate(input);
        if (errors.Count > 0) throw new InvalidOperationException(string.Join(" ", errors));
    }
}
