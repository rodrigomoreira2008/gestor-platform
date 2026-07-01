using Gestor.Api.Common;
using Gestor.Api.DTO;
using Gestor.Api.Entities;
using Gestor.Api.Validators;

namespace Gestor.Api.Services;

public class ProdutoService : CrudService<Produto, ProdutoDto>
{
    public ProdutoService(CrudRepository<Produto> repository, ProdutoValidator validator) : base(repository, validator)
    {
    }

    protected override ProdutoDto ToDto(Produto produto)
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

    protected override Produto ToEntity(ProdutoDto input)
    {
        return new Produto
        {
            Id = input.Id,
            Numero = input.Numero,
            Descricao = input.Descricao,
            Marca = input.Marca,
            Grupo = input.Grupo,
            Nomegrupo = input.Nomegrupo,
            Patrimonio = input.Patrimonio,
            Numeroserie = input.Numeroserie,
            Acessorio = input.Acessorio,
            Mostracontrato = input.Mostracontrato,
            Status = input.Status,
            Valorcompra = input.Valorcompra,
            Valorestimado = input.Valorestimado,
            Valorlimpeza = input.Valorlimpeza,
            Quantidadereal = input.Quantidadereal,
            Unidade = input.Unidade,
            Quantidadeestoque = input.Quantidadeestoque,
            Valorminimo = input.Valorminimo,
            Valormensal = input.Valormensal,
            Valordiario = input.Valordiario,
            Tipo = input.Tipo,
            Tabeladescontomensal = input.Tabeladescontomensal,
            Nometabeladescontomensal = input.Nometabeladescontomensal,
            Descricaodetalhada = input.Descricaodetalhada,
            Locacao = input.Locacao,
            Nomelocacao = input.Nomelocacao
        };
    }
}
