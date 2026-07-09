# Mapeamento de componentes Delphi

Este documento orienta como expandir o reconhecimento de componentes DFM usados pelo gerador.

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

1. Rode `resolve:form` no DFM/PAS real.
2. Se nenhum campo for encontrado, confira se o DFM e textual e completo.
3. Procure os componentes customizados usados na tela.
4. Compare com os componentes ja mapeados em `componentMapping.ts`.
5. Adicione o componente equivalente.
6. Rode novamente `resolve:form`.
7. Rode `validate:generated` antes de gerar arquivos.

## Cuidado

Nem todo componente visual deve virar campo de formulario. Componentes como painel, label, groupbox e botoes normalmente ajudam no layout ou nas acoes, mas nao representam campos persistidos.
