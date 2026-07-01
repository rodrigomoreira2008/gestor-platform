import type { GestorAction, GestorField, GestorForm } from '@gestor/dsl';
import { Alert, Box, CircularProgress, Snackbar, Typography } from '@mui/material';
import { CrudPage, type FormValues } from '@gestor/ui';
import { useState } from 'react';
import form from '../../../../../../examples/gestorloc/cadastro-produtos.gestor.json';
import { useCreateProduto, useProdutos } from '../hooks/useProdutos';

export function CadastroProdutosPage() {
  const produtos = useProdutos();
  const createProduto = useCreateProduto();
  const [values, setValues] = useState<FormValues>({});
  const [message, setMessage] = useState<string | null>(null);

  function handleValueChange(field: GestorField, value: unknown) {
    setValues((current) => ({ ...current, [field.name]: value }));
  }

  async function handleAction(action: GestorAction) {
    if (action.name === 'novo') {
      setValues({});
      return;
    }

    if (action.name === 'gravar') {
      await createProduto.mutateAsync(values);
      setMessage('Produto gravado com sucesso.');
    }
  }

  return (
    <Box>
      {produtos.isLoading && <CircularProgress size={24} />}

      {produtos.isError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Não foi possível carregar produtos da API neste momento.
        </Alert>
      )}

      {createProduto.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Não foi possível gravar o produto. Verifique os campos obrigatórios.
        </Alert>
      )}

      {produtos.data && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Produtos carregados da API: {produtos.data.length}
        </Typography>
      )}

      <CrudPage form={form as GestorForm} values={values} onValueChange={handleValueChange} onAction={handleAction} />

      <Snackbar open={message !== null} autoHideDuration={3000} message={message} onClose={() => setMessage(null)} />
    </Box>
  );
}
