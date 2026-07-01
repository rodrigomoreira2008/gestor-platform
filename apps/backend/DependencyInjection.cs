using System.Reflection;
using Gestor.Api.Common;

namespace Gestor.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddGestorGeneratedServices(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddScoped(typeof(CrudRepository<>));

        RegisterBySuffix(services, assembly, "Repository");
        RegisterBySuffix(services, assembly, "Service");
        RegisterBySuffix(services, assembly, "Validator");

        return services;
    }

    private static void RegisterBySuffix(IServiceCollection services, Assembly assembly, string suffix)
    {
        var types = assembly
            .GetTypes()
            .Where(type => type is { IsClass: true, IsAbstract: false } && type.Name.EndsWith(suffix, StringComparison.Ordinal));

        foreach (var type in types)
        {
            services.AddScoped(type);
        }
    }
}
