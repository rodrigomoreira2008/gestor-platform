using Gestor.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestor.Api.Data;

public class GestorDbContext : DbContext
{
    public GestorDbContext(DbContextOptions<GestorDbContext> options) : base(options)
    {
    }

    public DbSet<Produto> Produtos => Set<Produto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Produto>(entity =>
        {
            entity.ToTable("Produtos");
            entity.HasKey(produto => produto.Id);
            entity.Property(produto => produto.Descricao).HasMaxLength(200);
            entity.Property(produto => produto.Marca).HasMaxLength(100);
            entity.Property(produto => produto.Unidade).HasMaxLength(20);
            entity.Property(produto => produto.Tipo).HasMaxLength(50);
        });
    }
}
