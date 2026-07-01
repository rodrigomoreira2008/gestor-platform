using Gestor.Api.Common;
using Gestor.Api.DTO;
using Gestor.Api.Entities;
using Gestor.Api.Validators;

namespace Gestor.Api.Services;

public class ClienteService : CrudService<Cliente, ClienteDto>
{
    public ClienteService(CrudRepository<Cliente> repository, ClienteValidator validator) : base(repository, validator)
    {
    }

    protected override ClienteDto ToDto(Cliente cliente)
    {
        return new ClienteDto
        {
            Id = cliente.Id,
            Nome = cliente.Nome,
            Fantasia = cliente.Fantasia,
            Documento = cliente.Documento,
            InscricaoEstadual = cliente.InscricaoEstadual,
            Telefone = cliente.Telefone,
            Celular = cliente.Celular,
            Email = cliente.Email,
            Cep = cliente.Cep,
            Endereco = cliente.Endereco,
            Numero = cliente.Numero,
            Complemento = cliente.Complemento,
            Bairro = cliente.Bairro,
            Cidade = cliente.Cidade,
            Uf = cliente.Uf,
            Situacao = cliente.Situacao,
            Observacoes = cliente.Observacoes
        };
    }

    protected override Cliente ToEntity(ClienteDto input)
    {
        return new Cliente
        {
            Id = input.Id,
            Nome = input.Nome,
            Fantasia = input.Fantasia,
            Documento = input.Documento,
            InscricaoEstadual = input.InscricaoEstadual,
            Telefone = input.Telefone,
            Celular = input.Celular,
            Email = input.Email,
            Cep = input.Cep,
            Endereco = input.Endereco,
            Numero = input.Numero,
            Complemento = input.Complemento,
            Bairro = input.Bairro,
            Cidade = input.Cidade,
            Uf = input.Uf,
            Situacao = input.Situacao,
            Observacoes = input.Observacoes
        };
    }
}
