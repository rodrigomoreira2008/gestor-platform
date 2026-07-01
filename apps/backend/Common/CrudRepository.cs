using Gestor.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Gestor.Api.Common;

public class CrudRepository<TEntity> where TEntity : class, IEntity
{
    private readonly GestorDbContext _db;

    public CrudRepository(GestorDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<TEntity>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _db.Set<TEntity>().AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task<TEntity?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return await _db.Set<TEntity>().AsNoTracking().FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);
    }

    public async Task<TEntity> CreateAsync(TEntity entity, CancellationToken cancellationToken)
    {
        _db.Set<TEntity>().Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> UpdateAsync(TEntity entity, CancellationToken cancellationToken)
    {
        var existing = await _db.Set<TEntity>().FirstOrDefaultAsync(item => item.Id == entity.Id, cancellationToken);
        if (existing is null) return false;

        _db.Entry(existing).CurrentValues.SetValues(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var existing = await _db.Set<TEntity>().FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);
        if (existing is null) return false;

        _db.Set<TEntity>().Remove(existing);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
