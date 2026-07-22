# Contrato de estado vazio do frontend gerado

O validador `validateGeneratedFrontendEmptyState.ts` confirma que as páginas CRUD geradas apresentam estados vazios úteis e contextuais no `DataGrid`.

## Objetivo

Evitar que uma grade sem linhas pareça quebrada ou incompleta. O frontend deve distinguir entre:

- ausência total de registros cadastrados;
- ausência de resultados causada por pesquisa global ou filtros avançados.

## Comportamento esperado

Quando não existem registros e nenhum critério está ativo, o grid deve exibir:

- `Nenhum registro cadastrado.`;
- orientação para cadastrar o primeiro registro;
- botão `Cadastrar primeiro registro`, que abre o diálogo de inclusão.

Quando há pesquisa ou filtros ativos, mas nenhuma linha corresponde aos critérios, o grid deve exibir:

- `Nenhum resultado encontrado.`;
- orientação para revisar a pesquisa ou os filtros;
- nenhuma ação de primeiro cadastro.

## Verificações

O contrato verifica:

1. geração da página da entidade;
2. detecção de pesquisa ou filtros ativos;
3. componente dedicado de overlay;
4. layout centralizado na área do grid;
5. mensagem para base vazia;
6. mensagem para resultado filtrado vazio;
7. orientação para primeiro cadastro;
8. orientação para revisão dos critérios;
9. ação contextual de primeiro cadastro;
10. ícone semântico na ação;
11. abertura do diálogo de inclusão;
12. ocultação da ação quando há filtros ativos;
13. ligação do overlay ao slot `noRowsOverlay` do `DataGrid`.

## Execução

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendEmptyState.ts fixtures/cadastro-produtos.dfm fixtures/cadastro-produtos.pas Produto PRODUTOS
```

## Marcador de sucesso

```text
FRONTEND_EMPTY_STATE_OK:Produto:checks=13:passed=13
```

O contrato também integra a suíte agregada `validateFixtureFrontendTabbedForms.ts` e é executado para as cinco fixtures oficiais.
