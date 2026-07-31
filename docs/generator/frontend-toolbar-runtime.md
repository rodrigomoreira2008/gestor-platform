# Contrato da toolbar do frontend gerado

O validador `validateGeneratedFrontendToolbar.ts` protege a estrutura da área de ferramentas das páginas CRUD geradas pelo parser Delphi.

## Objetivo

Garantir que cada página gerada apresente uma hierarquia consistente antes do `DataGrid`, reunindo identificação da entidade, ação de inclusão, resumo da listagem, pesquisa global e filtros avançados.

## Execução

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendToolbar.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Para saída estruturada, acrescente `--json`.

## Verificações

O contrato possui 12 checks:

1. geração do arquivo da página;
2. layout flexível do cabeçalho;
3. título com o nome da entidade;
4. ação `Novo` ligada ao estado de inclusão;
5. ícone semântico na ação de inclusão;
6. contador de abas inferidas;
7. contador de registros exibidos;
8. pesquisa global na área de ferramentas;
9. filtros avançados na área de ferramentas;
10. bloqueio dos filtros durante o carregamento;
11. ordem da hierarquia visual;
12. renderização do grid depois dos controles.

## Marcador de sucesso

Para a fixture de produtos, o marcador esperado é:

```text
FRONTEND_TOOLBAR_OK:Produto:checks=12:passed=12
```

## Suíte agregada

O contrato `toolbar` integra `validateFixtureFrontendTabbedForms.ts`. Com 28 contratos aplicados às cinco fixtures oficiais, a suíte agregada executa 140 validações.
