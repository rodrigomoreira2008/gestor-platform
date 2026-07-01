import type { GestorAction, GestorField, GestorForm } from '@gestor/dsl';
import { Alert, Box, CircularProgress, Snackbar, Typography } from '@mui/material';
import { CrudPage, type FormValues } from '@gestor/ui';
import axios from 'axios';
import { useState } from 'react';
import form from '../../../../../../examples/gestorloc/cadastro-produtos.gestor.json';
import { ProdutoList } from '../components/ProdutoList';
import { useCreateProduto, useProdutos, useRemoveProduto, useUpdateProduto } from '../hooks/useProdutos';
import type { Produto } from '../types/produto';

export function CadastroProdutosPage() {
  const produtos = useProdutos();
  const createProduto = useCreateProduto();
  const updateProduto = useUpdateProduto();
  const removeProduto = useRemoveProduto();
  const [values, setValues] = useState<FormValues>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleValueChange(field: GestorField, value: unknown) {
    setValues((current) => ({ ...current, [field.name]: value }));
  }

  async function handleAction(action: GestorAction) {
    if (action.name === 'novo') {
      clearForm();
      return;
    }

    if (action.name === 'cancelar') {
      clearForm();
      return;
    }

    if (action.name === 'gravar') {
      try {
        setValidationError(null);

        if (selectedId) {
          await updateProduto.mutateAsync({ id: selectedId, input: values });
          setMessage('Produto atualizado com sucesso.');
        } else {
          await createProduto.mutateAsync(values);
          setMessage('Produto gravado com sucesso.');
        }

        clearForm();
      } catch (error) {
        setValidationError(readApiError(error));
      }
    }
  }

  function handleSelect(produto: Produto) {
    setSelectedId(produto.id);
    setValidationError(null);
    setValues(produtoToFormValues(produto));
  }

  async function handleDelete(produto: Produto) {
    await removeProduto.mutateAsync(produto.id);
    if (selectedId === produto.id) clearForm();
    setMessage('Produto excluído com sucesso.');
  }

  function clearForm() {
    setValues({});
    setSelectedId(null);
    setValidationError(null);
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
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Produtos carregados da API: {produtos.data.length}
          </Typography>
          <ProdutoList produtos={produtos.data} selectedId={selectedId} onSelect={handleSelect} onDelete={handleDelete} />
        </>
      )}

      <CrudPage form={form as GestorForm} values={values} onValueChange={handleValueChange} onAction={handleAction} />

      <Snackbar open={message !== null} autoHideDuration={3000} message={message} onClose={() => setMessage(null)} />
    </Box>
  );
}

function produtoToFormValues(produto: Produto): FormValues {
  return {
    numero: produto.numero,
    descricao: produto.descricao,
    marca: produto.marca,
    grupo: produto.grupo,
    nomegrupo: produto.nomegrupo,
    patrimonio: produto.patrimonio,
    numeroserie: produto.numeroserie,
    acessorio: produto.acessorio,
    mostracontrato: produto.mostracontrato,
    status: produto.status,
    valorcompra: produto.valorcompra,
    valorestimado: produto.valorestimado,
    valorlimpeza: produto.valorlimpeza,
    quantidadereal: produto.quantidadereal,
    unidade: produto.unidade,
    quantidadeestoque: produto.quantidadeestoque,
    valorminimo: produto.valorminimo,
    valormensal: produto.valormensal,
    valordiario: produto.valordiario,
    tipo: produto.tipo,
    tabeladescontomensal: produto.tabeladescontomensal,
    nometabeladescontomensal: produto.nometabeladescontomensal,
    descricaodetalhada: produto.descricaodetalhada,
    locacao: produto.locacao,
    nomelocacao: produto.nomelocacao
  };
}

function readApiError(error: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? 'Não foi possível gravar o produto.';
  }

  return 'Não foi possível gravar o produto.';
}
