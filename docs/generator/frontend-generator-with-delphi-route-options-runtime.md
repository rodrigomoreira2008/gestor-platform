# Opções de rota do gerador frontend com ações Delphi

## Objetivo

Permitir que a geração composta configure a rota sugerida da página orientada pelos eventos Delphi sem exigir edição manual dos arquivos `.txt` gerados.

## API

```ts
interface FrontendGeneratorWithDelphiActionsOptions extends FrontendGeneratorOptions {
  routePath?: string;
  routeExportAlias?: string;
}
```

Uso:

```ts
generateFrontendFilesWithDelphiActions(resolved, {
  outputRoot: 'apps/frontend/src/modules/produtos',
  routePath: '/cadastros/produtos',
  routeExportAlias: 'produtoRoute'
});
```

## Artefatos afetados

```text
Generated/ProdutoDelphiRoute.tsx.txt
Generated/ProdutoPageSelection.tsx.txt
```

O primeiro arquivo exporta o objeto de rota configurado. O segundo mostra as opções CRUD genérica e orientada pelo Delphi usando o mesmo caminho.

## Normalização

`routePath` é encaminhado ao gerador de rotas, que:

- adiciona a barra inicial quando ausente;
- remove barras finais excedentes;
- preserva `/` como rota raiz.

## Compatibilidade

As opções são opcionais. Sem configuração explícita, o comportamento continua usando:

```text
/<plural-da-entidade>
```

e o alias padrão:

```text
<entidadeCamelCase>DelphiRoute
```

## Contrato

O contrato está em:

```text
packages/delphi-parser/src/cli/validateFrontendGeneratorWithDelphiActionsOptions.ts
```

Saída esperada:

```text
FRONTEND_GENERATOR_WITH_DELPHI_ACTIONS_OPTIONS_OK:checks=10:passed=10
```

O contrato verifica o caminho de saída, alias, normalização da rota, presença das duas estratégias de página e manutenção dos artefatos Delphi na geração composta.
