using Gestor.Api.Data;
using Gestor.Api.DTO;
using Gestor.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestor.Api.Repositories;

public class ProdutoRepository
{
    private readonly GestorDbContext _db;

    public ProdutoRepository(GestorDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<ProdutoDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _db.Produtos
            .AsNoTracking()
            .OrderBy(produto => produto.Descricao)
            .Select(produto => ToDto(produto))
            .ToListAsync(cancellationToken);
    }

    public async Task<ProdutoDto?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var produto = await _db.Produtos.AsNoTracking().FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        return produto is null ? null : ToDto(produto);
    }

    public async Task<ProdutoDto> CreateAsync(ProdutoDto input, CancellationToken cancellationToken)
    {
        var produto = ToEntity(input);
        _db.Produtos.Add(produto);
        await _db.SaveChangesAsync(cancellationToken);
        return ToDto(produto);
    }

    public async Task UpdateAsync(ProdutoDto input, CancellationToken cancellationToken)
    {
        var produto = await _db.Produtos.FirstOrDefaultAsync(item => item.Id == input.Id, cancellationToken);
        if (produto is null) return;

        CopyToEntity(input, produto);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var produto = await _db.Produtos.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (produto is null) return;

        _db.Produtos.Remove(produto);
        await _db.SaveChangesAsync(cancellationToken);
    }

    private static ProdutoDto ToDto(Produto produto)
    {
        return new ProdutoDto
        {
            Id = produto.Id,
            Numero = produto.Numero,
            Descricao = produto.Descricao,
            Marca = produto.Marca,
            Grupo = produto.Grupo,
            Nomegrupo = produto.Nomegrupo,
            Patrimonio = produto.Patrimonio,
            Numeroserie = produto.Numeroserie,
            Acessorio = produto.Acessorio,
            Mostracontrato = produto.Mostracontrato,
            Status = produto.Status,
            Valorcompra = produto.Valorcompra,
            Valorestimado = produto.Valorestimado,
            Valorlimpeza = produto.Valorlimpeza,
            Quantidadereal = produto.Quantidadereal,
            Unidade = produto.Unidade,
            Quantidadeestoque = produto.Quantidadeestoque,
            Valorminimo = produto.Valorminimo,
            Valormensal = produto.Valormensal,
            Valordiario = produto.Valordiario,
            Tipo = produto.Tipo,
            Tabeladescontomensal = produto.Tabeladescontomensal,
            Nometabeladescontomensal = produto.Nometabeladescontomensal,
            Descricaodetalhada = produto.Descricaodetalhada,
            Locacao = produto.Locacao,
            Nomelocacao = produto.Nomelocacao
        };
    }

    private static Produto ToEntity(ProdutoDto input)
    {
        var produto = new Produto();
        CopyToEntity(input, produto);
        return produto;
    }

    private static void CopyToEntity(ProdutoDto input, Produto produto)
    {
        produto.Numero = input.Numero;
        produto.Descricao = input.Descricao;
        produto.Marca = input.Marca;
        produto.Grupo = input.Grupo;
        produto.Nomegrupo = input.Nomegrupo;
        produto.Patrimonio = input.Patrimonio;
        produto.Numeroserie = input.Numeroserie;
        produto.Acessorio = input.Acessorio;
        produto.Mostracontrato = input.Mostracontrato;
        produto.Status = input.Status;
        produto.Valorcompra = input.Valorcompra;
        produto.Valorestimado = input.Valorestimado;
        produto.Valorlimpeza = input.Valorlimpeza;
        produto.Quantidadereal = input.Quantidadereal;
        produto.Unidade = input.Unidade;
        produto.Quantidadeestoque = input.Quantidadeestoque;
        produto.Valorminimo = input.Valorminimo;
        produto.Valormensal = input.Valormensal;
        produto.Valordiario = input.Valordiario;
        produto.Tipo = input.Tipo;
        produto.Tabeladescontomensal = input.Tabeladescontomensal;
        produto.Nometabeladescontomensal = input.Nometabeladescontomensal;
        produto.Descricaodetalhada = input.Descricaodetalhada;
        produto.Locacao = input.Locacao;
        produto.Nomelocacao = input.Nomelocacao;
    }
}
