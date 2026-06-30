# Estratégia de Migração

## Objetivo

Migrar o GestorLoc de Delphi para uma aplicação web moderna, acessível por navegadores, tablets e celulares.

## Abordagem

A migração será incremental e orientada por plataforma.

### Etapa 1 - Inventário

- Mapear formulários `.dfm`.
- Mapear units `.pas`.
- Identificar DataModules.
- Identificar componentes de terceiros.
- Identificar SQL embutido.
- Identificar relatórios.

### Etapa 2 - DSL

Cada tela Delphi será convertida para uma descrição intermediária:

```yaml
entity: exemplo
source:
  dfm: CadastroExemplo.dfm
  pas: CadastroExemplo.pas
layout:
  type: form
fields: []
actions: []
rules: []
```

### Etapa 3 - Geradores

A partir da DSL, serão gerados:

- Página React.
- Formulários.
- Grids.
- Rotas.
- DTOs.
- Endpoints da API.
- Validações.

### Etapa 4 - Validação manual

A automação reduzirá o trabalho repetitivo, mas regras críticas serão revisadas manualmente.

### Etapa 5 - Migração por módulo

Ordem inicial sugerida:

1. Autenticação e permissões.
2. Cadastros base.
3. Produtos/equipamentos.
4. Clientes.
5. Pedidos de locação.
6. Financeiro.
7. Estoque.
8. Relatórios.

## Critério de pronto

Um módulo é considerado migrado quando possui:

- UI responsiva.
- API funcional.
- Validações equivalentes.
- Testes mínimos.
- Documentação.
- Homologação funcional.
