using Gestor.Api.DTO;

namespace Gestor.Api.Validators;

public class ProdutoValidator
{
    public IReadOnlyList<string> Validate(ProdutoDto input)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(input.Descricao)) errors.Add("Descrição é obrigatória.");
        if (string.IsNullOrWhiteSpace(input.Marca)) errors.Add("Marca é obrigatória.");
        if (input.Grupo is null) errors.Add("Grupo é obrigatório.");
        if (input.Valorestimado is null) errors.Add("Valor estimado é obrigatório.");
        if (string.IsNullOrWhiteSpace(input.Unidade)) errors.Add("Unidade é obrigatória.");
        if (string.IsNullOrWhiteSpace(input.Tipo)) errors.Add("Tipo de locação é obrigatório.");
        if (input.Locacao is null) errors.Add("Locação é obrigatória.");

        return errors;
    }
}
