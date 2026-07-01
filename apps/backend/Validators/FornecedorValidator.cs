using Gestor.Api.Common;
using Gestor.Api.DTO;

namespace Gestor.Api.Validators;

public class FornecedorValidator : IValidator<FornecedorDto>
{
    public IReadOnlyList<string> Validate(FornecedorDto input)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(input.RazaoSocial)) errors.Add("Razão social é obrigatória.");
        if (string.IsNullOrWhiteSpace(input.Documento)) errors.Add("CNPJ/CPF é obrigatório.");
        if (string.IsNullOrWhiteSpace(input.Cidade)) errors.Add("Cidade é obrigatória.");
        if (string.IsNullOrWhiteSpace(input.Uf)) errors.Add("UF é obrigatória.");

        return errors;
    }
}
