# Comandos do Gestor Converter

O `gestor-converter` é a ferramenta CLI responsável por transformar arquivos Delphi em artefatos da plataforma.

## Converter DFM para DSL

```bash
gestor-converter \
  --input CadastroPedidos.dfm \
  --output CadastroPedidos.gestor.json
```

## Converter DFM para DSL + React

```bash
gestor-converter \
  --input CadastroPedidos.dfm \
  --output CadastroPedidos.gestor.json \
  --react-output CadastroPedidosPage.tsx
```

## Converter DFM para DSL + React + API .NET

```bash
gestor-converter \
  --input CadastroPedidos.dfm \
  --output CadastroPedidos.gestor.json \
  --react-output CadastroPedidosPage.tsx \
  --api-output-dir apps/backend
```

## Gerar relatório técnico de PAS

```bash
gestor-converter \
  --input CadastroPedidos.pas \
  --pas-report-output CadastroPedidos.pas-report.json
```

## Gerar relatório consolidado de módulo

```bash
gestor-converter \
  --dfm-input CadastroPedidos.dfm \
  --pas-input CadastroPedidos.pas \
  --module-report-output CadastroPedidos.migration-report.json
```

## Saídas previstas

### DSL

Arquivo `.gestor.json` com estrutura intermediária validada.

### React

Componente `.tsx` usando `@gestor/ui`.

### API .NET

Arquivos gerados em:

```text
Entities/
DTO/
Controllers/
Services/
Repositories/
Validators/
```

### Relatório de módulo

Arquivo JSON contendo:

- campos da tela;
- classes Delphi;
- métodos;
- SQL encontrado;
- avisos de conversão;
- resumo técnico.
