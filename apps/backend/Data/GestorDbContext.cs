using Gestor.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestor.Api.Data;

public class GestorDbContext : DbContext
{
    public GestorDbContext(DbContextOptions<GestorDbContext> options) : base(options)
    {
    }

    public DbSet<Produto> Produtos => Set<Produto>();
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Fornecedor> Fornecedores => Set<Fornecedor>();

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

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.ToTable("Clientes");
            entity.HasKey(cliente => cliente.Id);
            entity.Property(cliente => cliente.Nome).HasMaxLength(200);
            entity.Property(cliente => cliente.Fantasia).HasMaxLength(200);
            entity.Property(cliente => cliente.Documento).HasMaxLength(20);
            entity.Property(cliente => cliente.Email).HasMaxLength(150);
            entity.Property(cliente => cliente.Uf).HasMaxLength(2);
            entity.Property(cliente => cliente.Situacao).HasMaxLength(30);
        });

        modelBuilder.Entity<Fornecedor>(entity =>
        {
            entity.ToTable("Fornecedores");
            entity.HasKey(fornecedor => fornecedor.Id);
            entity.Property(fornecedor => fornecedor.RazaoSocial).HasMaxLength(200);
            entity.Property(fornecedor => fornecedor.Fantasia).HasMaxLength(200);
            entity.Property(fornecedor => fornecedor.Documento).HasMaxLength(20);
            entity.Property(fornecedor => fornecedor.Email).HasMaxLength(150);
            entity.Property(fornecedor => fornecedor.Uf).HasMaxLength(2);
        });
    }
}
