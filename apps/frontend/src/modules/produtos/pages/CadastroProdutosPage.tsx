import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { CrudPage } from '@gestor/ui';
import type { GestorForm } from '@gestor/dsl';
import form from '../../../../../../examples/gestorloc/cadastro-produtos.gestor.json';
import { useProdutos } from '../hooks/useProdutos';

export function CadastroProdutosPage() {
  const produtos = useProdutos();

  return (
    <Box>
      {produtos.isLoading && <CircularProgress size={24} />}

      {produtos.isError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Não foi possível carregar produtos da API neste momento.
        </Alert>
      )}

      {produtos.data && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Produtos carregados da API: {produtos.data.length}
        </Typography>
      )}

      <CrudPage form={form as GestorForm} />
    </Box>
  );
}
