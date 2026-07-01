namespace Gestor.Api.Entities;

public class Produto
{
    public int Id { get; set; }
    public int? Numero { get; set; }
    public string? Descricao { get; set; }
    public string? Marca { get; set; }
    public int? Grupo { get; set; }
    public string? Nomegrupo { get; set; }
    public string? Patrimonio { get; set; }
    public string? Numeroserie { get; set; }
    public string? Acessorio { get; set; }
    public string? Mostracontrato { get; set; }
    public string? Status { get; set; }
    public decimal? Valorcompra { get; set; }
    public decimal? Valorestimado { get; set; }
    public decimal? Valorlimpeza { get; set; }
    public decimal? Quantidadereal { get; set; }
    public string? Unidade { get; set; }
    public decimal? Quantidadeestoque { get; set; }
    public decimal? Valorminimo { get; set; }
    public decimal? Valormensal { get; set; }
    public decimal? Valordiario { get; set; }
    public string? Tipo { get; set; }
    public int? Tabeladescontomensal { get; set; }
    public string? Nometabeladescontomensal { get; set; }
    public string? Descricaodetalhada { get; set; }
    public int? Locacao { get; set; }
    public string? Nomelocacao { get; set; }
}
