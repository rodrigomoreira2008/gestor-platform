# Validação dinâmica do formulário frontend

O comando abaixo executa o componente de formulário React gerado em um ambiente isolado:

```bash
pnpm --filter @gestor/delphi-parser validate:frontend-form \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para executar a validação nos cinco fixtures:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-form
```

## Cobertura

A validação transpila e executa `components/<Entidade>Form.tsx` com implementações instrumentadas de React e Material UI. Ela confirma:

- export da função `<Entidade>Form`;
- retorno de uma árvore JSX válida;
- container raiz configurado como formulário;
- existência e execução do manipulador `onSubmit`;
- chamada de `preventDefault`;
- encaminhamento do estado atual ao callback externo;
- exatamente um botão com `type="submit"`;
- bloqueio do botão durante `isSubmitting`;
- quantidade de controles compatível com os campos inferidos;
- inicialização do estado a partir de `initialValue`;
- ausência de módulos externos não autorizados;
- limite de execução de um segundo.

## Resultado

Uma execução bem-sucedida emite um marcador no formato:

```text
FRONTEND_FORM_OK:Produto:fields=5:nodes=12
```

A saída JSON inclui o arquivo avaliado, exports encontrados, tipo do nó raiz, número de controles, quantidade de botões de envio, inicializações e alterações de estado, submissões e diagnósticos.

## Pipeline

A etapa `Execute generated frontend form contract tests` é executada depois da validação dinâmica da página CRUD e antes da validação global das rotas. O auditor do workflow exige a presença dessa etapa, execução única e posicionamento correto.
