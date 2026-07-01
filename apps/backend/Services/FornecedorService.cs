using Gestor.Api.Common;
using Gestor.Api.DTO;
using Gestor.Api.Entities;
using Gestor.Api.Validators;

namespace Gestor.Api.Services;

public class FornecedorService : CrudService<Fornecedor, FornecedorDto>
{
    public FornecedorService(CrudRepository<Fornecedor> repository, FornecedorValidator validator) : base(repository, validator)
    {
    }

    protected override FornecedorDto ToDto(Fornecedor item)
    {
        return new FornecedorDto
        {
            Id = item.Id,
            RazaoSocial = item.RazaoSocial,
            Fantasia = item.Fantasia,
            Documento = item.Documento,
            InscricaoEstadual = item.InscricaoEstadual,
            Telefone = item.Telefone,
            Celular = item.Celular,
            Email = item.Email,
            Cep = item.Cep,
            Endereco = item.Endereco,
            Numero = item.Numero,
            Bairro = item.Bairro,
            Cidade = item.Cidade,
            Uf = item.Uf,
            Contato = item.Contato,
            Observacoes = item.Observacoes
        };
    }

    protected override Fornecedor ToEntity(FornecedorDto input)
    {
        return new Fornecedor
        {
            Id = input.Id,
            RazaoSocial = input.RazaoSocial,
            Fantasia = input.Fantasia,
            Documento = input.Documento,
            InscricaoEstadual = input.InscricaoEstadual,
            Telefone = input.Telefone,
            Celular = input.Celular,
            Email = input.Email,
            Cep = input.Cep,
            Endereco = input.Endereco,
            Numero = input.Numero,
            Bairro = input.Bairro,
            Cidade = input.Cidade,
            Uf = input.Uf,
            Contato = input.Contato,
            Observacoes = input.Observacoes
        };
    }
}
