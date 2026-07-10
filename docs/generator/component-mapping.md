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
2. Rode `resolve:form` no DFM/PAS real.
3. Se nenhum campo for encontrado, confira se o DFM e textual e completo.
4. Procure os componentes customizados usados na tela.
5. Compare com os componentes ja mapeados em `componentMapping.ts`.
6. Adicione o componente equivalente.
7. Rode novamente `resolve:form`.
8. Rode `validate:generated` antes de gerar arquivos.

## Cuidado

Nem todo componente visual deve virar campo de formulario. Componentes como painel, label, groupbox e botoes normalmente ajudam no layout ou nas acoes, mas nao representam campos persistidos.
