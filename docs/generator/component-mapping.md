# Mapeamento de componentes Delphi

Este documento orienta como expandir o reconhecimento de componentes DFM usados pelo gerador.

## Consultar o catalogo atual

```bash
pnpm --filter @gestor/delphi-parser list:components
```

A saida padrao e legivel por linha. Para JSON:

```bash
pnpm --filter @gestor/delphi-parser list:components --json
```

Tambem e possivel filtrar por papel ou texto:

```bash
pnpm --filter @gestor/delphi-parser list:components --role=grid
pnpm --filter @gestor/delphi-parser list:components --search=devexpress
pnpm --filter @gestor/delphi-parser list:components --role=select --json
```

O comando retorna erro quando nenhum componente corresponde aos filtros, facilitando uso em scripts de diagnostico.

## Analisar os componentes de um DFM real

```bash
pnpm --filter @gestor/delphi-parser analyze:components caminho/tela.dfm
```

O comando informa quantos componentes e classes existem no DFM, quais classes ja estao mapeadas e quais precisam de revisao. Ele tambem mostra exemplos de nomes de componentes encontrados.

Opcoes uteis:

```bash
pnpm --filter @gestor/delphi-parser analyze:components caminho/tela.dfm --json
pnpm --filter @gestor/delphi-parser analyze:components caminho/tela.dfm --fail-on-unknown
```

`--fail-on-unknown` retorna codigo de erro quando houver classes nao mapeadas, sendo util para auditorias e pipelines de migracao.

## Quando adicionar um mapeamento

Adicione ou revise o mapeamento quando:

- `resolve:form` falhar sem campos;
- campos importantes nao aparecerem no `ResolvedForm`;
- a tela usar componentes herdados ou customizados;
- o DFM tiver componentes equivalentes a `DBEdit`, `DBComboBox`, `DBLookupComboBox`, `DBCheckBox` ou `DBGrid` com outro nome.

## Arquivo principal

O catalogo inicial fica em:

```text
packages/delphi-parser/src/componentMapping.ts
```

## Campos comuns

Para um componente gerar campo editavel, normalmente o DFM precisa conter:

```pascal
DataSource = DsCadastro
DataField = 'NOME_DO_CAMPO'
```

Componentes de lookup geralmente tambem precisam conter:

```pascal
ListSource = DsGrupo
KeyField = 'ID'
ListField = 'NOME'
```

## Processo recomendado

1. Rode `list:components` para conferir o catalogo atual.
2. Rode `analyze:components` no DFM real.
3. Se houver classes nao mapeadas, identifique os equivalentes visuais e de dados.
4. Adicione os componentes relevantes em `componentMapping.ts`.
5. Rode novamente `analyze:components --fail-on-unknown`.
6. Rode `resolve:form` no DFM/PAS real.
7. Rode `validate:generated` antes de gerar arquivos.

## Cuidado

Nem todo componente visual deve virar campo de formulario. Componentes como painel, label, groupbox e botoes normalmente ajudam no layout ou nas acoes, mas nao representam campos persistidos.
