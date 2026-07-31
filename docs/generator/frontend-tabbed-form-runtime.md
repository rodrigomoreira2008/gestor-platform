# Validação dinâmica do formulário frontend com abas

A validação executa o componente React `<Entidade>TabbedForm` gerado em um ambiente isolado e instrumentado.

## Comando individual

```bash
pnpm --filter @gestor/delphi-parser validate:frontend-tabbed-form \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para emitir JSON, acrescente `-- --json`.

## Todos os fixtures

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-tabbed-form
```

O executor agregado percorre os fixtures de produtos, parceiros, grupos de produtos, grupos de parceiros e pedidos. Cada execução possui timeout próprio e uma falha não impede a coleta dos resultados restantes.

## Contratos verificados

A validação confirma:

- export `<Entidade>TabbedForm`;
- árvore JSX válida com raiz configurada como formulário;
- quantidade compatível de abas e painéis;
- exatamente um botão de envio;
- presença do botão Restaurar;
- chamada de `schema.safeParse`;
- envio do valor normalizado para `onSubmit`;
- notificação de alterações por `onDirtyChange`;
- registro e limpeza do listener `beforeunload`;
- carregamento apenas das dependências autorizadas;
- execução dentro do limite configurado.

## Marcador de sucesso

```text
FRONTEND_TABBED_FORM_OK:Produto:tabs=2:nodes=28
```

A ausência do marcador, uma exceção, timeout ou contrato inválido encerra o comando com código diferente de zero.

## Pipeline

O GitHub Actions executa essa etapa depois dos testes do formulário simples e antes da validação global das rotas. O `validate:workflow` garante que o comando apareça exatamente uma vez e permaneça nessa posição.
