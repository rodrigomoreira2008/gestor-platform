# Tratamento do Código-Fonte Delphi Legado

## Objetivo

Definir como o código Delphi do GestorLoc será recebido, armazenado e analisado durante a migração.

## Princípio

O repositório `gestor-platform` contém a plataforma de migração e a nova aplicação web. O código Delphi legado deve ser tratado como insumo de migração, não como parte permanente da aplicação final.

## Estrutura recomendada localmente

```text
gestor-platform/
  legacy/
    GestorLoc/
      *.dpr
      *.dproj
      *.pas
      *.dfm
      ...
  reports/
    inventory-report.json
    migration-reports/
```

## Pastas sensíveis

A pasta `legacy/` deve ser usada apenas em ambiente controlado. Ela pode conter:

- credenciais antigas;
- strings de conexão;
- nomes de servidores;
- regras comerciais sensíveis;
- dados de clientes em arquivos de configuração;
- código proprietário.

## Política de versionamento

Por padrão, recomenda-se **não versionar** o código Delphi legado dentro do repositório público da plataforma.

Opções seguras:

1. manter `legacy/` apenas localmente;
2. usar um repositório privado separado para o Delphi;
3. enviar apenas trechos específicos para análise;
4. remover credenciais antes de qualquer commit.

## Fluxo recomendado

1. Copiar o projeto Delphi para `legacy/GestorLoc` localmente.
2. Executar o inventário:

```bash
pnpm --filter @gestor/inventory build
pnpm --filter @gestor/inventory exec gestor-inventory --root ./legacy/GestorLoc --output ./reports/inventory-report.json
```

3. Selecionar o primeiro módulo piloto.
4. Executar o conversor nos arquivos `.dfm` e `.pas` do módulo.
5. Gerar DSL, React, API .NET e relatório de migração.

## Atenção

Antes de subir qualquer arquivo legado ao GitHub, revisar:

- `.ini`
- `.udl`
- `.cfg`
- `.conf`
- `.pas` com strings de conexão;
- arquivos SQL com nomes de servidores;
- arquivos de backup;
- certificados ou chaves.
