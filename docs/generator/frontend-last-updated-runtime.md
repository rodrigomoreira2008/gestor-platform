# Contrato runtime: última atualização do frontend

O frontend gerado exibe quando a listagem foi atualizada pela última vez.

## Comportamento

- O timestamp usa `dataUpdatedAt` retornado pelo React Query.
- O valor é atualizado após carregamentos e `refetch` manuais.
- A data é formatada no locale `pt-BR`.
- O formato combina data curta e horário com segundos.
- Antes da primeira resposta válida, a interface exibe `Aguardando dados`.
- O indicador aparece ao lado da contagem `registros exibidos / total carregado`.

## Exemplo gerado

```tsx
const lastUpdatedAt = list.dataUpdatedAt > 0
  ? new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium'
    }).format(new Date(list.dataUpdatedAt))
  : 'Aguardando dados';
```

## Validação

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendLastUpdated.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Saída esperada:

```text
FRONTEND_LAST_UPDATED_OK:Produto:checks=9:passed=9
```
