using Gestor.Api.DTO;

namespace Gestor.Api.Repositories;

public class ProdutoRepository
{
    private static readonly List<ProdutoDto> Items = [];

    public Task<IEnumerable<ProdutoDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return Task.FromResult<IEnumerable<ProdutoDto>>(Items);
    }

    public Task<ProdutoDto?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return Task.FromResult(Items.FirstOrDefault(item => item.Id == id));
    }

    public Task<ProdutoDto> CreateAsync(ProdutoDto input, CancellationToken cancellationToken)
    {
        input.Id = Items.Count == 0 ? 1 : Items.Max(item => item.Id) + 1;
        Items.Add(input);
        return Task.FromResult(input);
    }

    public Task UpdateAsync(ProdutoDto input, CancellationToken cancellationToken)
    {
        var index = Items.FindIndex(item => item.Id == input.Id);
        if (index >= 0) Items[index] = input;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        Items.RemoveAll(item => item.Id == id);
        return Task.CompletedTask;
    }
}
