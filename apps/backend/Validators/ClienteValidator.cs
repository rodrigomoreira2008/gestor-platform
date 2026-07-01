using Gestor.Api.Common;
using Gestor.Api.DTO;

namespace Gestor.Api.Validators;

public class ClienteValidator : IValidator<ClienteDto>
{
    public IReadOnlyList<string> Validate(ClienteDto input)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(input.Nome)) errors.Add("Nome é obrigatório.");
        if (string.IsNullOrWhiteSpace(input.Documento)) errors.Add("CPF/CNPJ é obrigatório.");
        if (string.IsNullOrWhiteSpace(input.Cidade)) errors.Add("Cidade é obrigatória.");
        if (string.IsNullOrWhiteSpace(input.Uf)) errors.Add("UF é obrigatória.");

        return errors;
    }
}
