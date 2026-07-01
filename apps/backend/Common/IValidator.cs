namespace Gestor.Api.Common;

public interface IValidator<in TDto>
{
    IReadOnlyList<string> Validate(TDto input);
}
