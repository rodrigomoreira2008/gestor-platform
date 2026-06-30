# Inventário do Projeto Delphi

A ferramenta `gestor-inventory` gera um relatório inicial do sistema Delphi legado antes da migração.

## Objetivo

Antes de converter telas, precisamos entender o tamanho e a composição do sistema:

- quantidade de formulários `.dfm`;
- quantidade de units `.pas`;
- projetos `.dpr` e `.dproj`;
- possíveis DataModules;
- arquivos SQL, imagens, relatórios e recursos;
- distribuição por extensão.

## Comando

```bash
pnpm --filter @gestor/inventory build
pnpm --filter @gestor/inventory exec gestor-inventory --root ./GestorLoc --output ./reports/inventory-report.json
```

## Saída

O relatório JSON contém:

```json
{
  "root": "./GestorLoc",
  "generatedAt": "2026-01-01T00:00:00.000Z",
  "totals": {
    "files": 0,
    "bytes": 0
  },
  "byExtension": {},
  "delphi": {
    "forms": [],
    "units": [],
    "projects": [],
    "dataModulesCandidates": []
  },
  "files": []
}
```

## Como usar no processo de migração

1. Executar o inventário no projeto Delphi original.
2. Analisar o número de formulários e units.
3. Identificar módulos prioritários.
4. Selecionar um módulo piloto.
5. Rodar o conversor em `.dfm` e `.pas` do módulo escolhido.

## Observações

A ferramenta ignora automaticamente pastas comuns como:

- `.git`
- `node_modules`
- `dist`
- `build`
- `bin`
- `obj`
- `__history`

Isso evita poluir o relatório com arquivos compilados, temporários ou históricos do Delphi.
