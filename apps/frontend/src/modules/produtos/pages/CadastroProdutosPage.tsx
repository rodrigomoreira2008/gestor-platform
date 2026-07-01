import type { GestorAction, GestorField, GestorForm } from '@gestor/dsl';
import { Alert, Box, CircularProgress, Snackbar, Typography } from '@mui/material';
import { CrudPage, type FormValues } from '@gestor/ui';
import axios from 'axios';
import { useState } from 'react';
import form from '../../../../../../examples/gestorloc/cadastro-produtos.gestor.json';
import { useCreateProduto, useProdutos } from '../hooks/useProdutos';

export function CadastroProdutosPage() {
  const produtos = useProdutos();
  const createProduto = useCreateProduto();
  const [values, setValues] = useState<FormValues>({});
  const [message, setMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleValueChange(field: GestorField, value: unknown) {
    setValues((current) => ({ ...current, [field.name]: value }));
  }

  async function handleAction(action: GestorAction) {
    if (action.name === 'novo') {
      setValues({});
      setValidationError(null);
      return;
    }

    if (action.name === 'gravar') {
      try {
        setValidationError(null);
        await createProduto.mutateAsync(values);
        setMessage('Produto gravado com sucesso.');
      } catch (error) {
        setValidationError(readApiError(error));
      }
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

      {validationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError}
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

function readApiError(error: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? 'Não foi possível gravar o produto.';
  }

  return 'Não foi possível gravar o produto.';
}
