using Gestor.Api.Common;

namespace Gestor.Api.Entities;

public class Cliente : IEntity
{
    public int Id { get; set; }
    public string? Nome { get; set; }
    public string? Fantasia { get; set; }
    public string? Documento { get; set; }
    public string? InscricaoEstadual { get; set; }
    public string? Telefone { get; set; }
    public string? Celular { get; set; }
    public string? Email { get; set; }
    public string? Cep { get; set; }
    public string? Endereco { get; set; }
    public string? Numero { get; set; }
    public string? Complemento { get; set; }
    public string? Bairro { get; set; }
    public string? Cidade { get; set; }
    public string? Uf { get; set; }
    public string? Situacao { get; set; }
    public string? Observacoes { get; set; }
}
