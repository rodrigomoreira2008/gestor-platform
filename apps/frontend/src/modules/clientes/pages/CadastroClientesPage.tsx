import type { GestorAction, GestorField, GestorForm } from '@gestor/dsl';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Typography } from '@mui/material';
import { CrudPage, type FormValues } from '@gestor/ui';
import axios from 'axios';
import { useState } from 'react';
import form from '../../../../../../examples/gestorloc/cadastro-clientes.gestor.json';
import { ClienteList } from '../components/ClienteList';
import { useClientes, useCreateCliente, useRemoveCliente, useUpdateCliente } from '../hooks/useClientes';
import type { Cliente } from '../types/cliente';

export function CadastroClientesPage() {
  const clientes = useClientes();
  const createCliente = useCreateCliente();
  const updateCliente = useUpdateCliente();
  const removeCliente = useRemoveCliente();
  const [values, setValues] = useState<FormValues>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Cliente | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const isSaving = createCliente.isPending || updateCliente.isPending;
  const isDeleting = removeCliente.isPending;

  function handleValueChange(field: GestorField, value: unknown) {
    setValues((current) => ({ ...current, [field.name]: value }));
  }

  async function handleAction(action: GestorAction) {
    if (action.name === 'novo' || action.name === 'cancelar') {
      clearForm();
      return;
    }

    if (action.name === 'gravar') {
      try {
        setValidationError(null);

        if (selectedId) {
          await updateCliente.mutateAsync({ id: selectedId, input: values });
          setMessage('Cliente atualizado com sucesso.');
        } else {
          await createCliente.mutateAsync(values);
          setMessage('Cliente gravado com sucesso.');
        }

        clearForm();
      } catch (error) {
        setValidationError(readApiError(error));
      }
    }
  }

  function handleSelect(cliente: Cliente) {
    setSelectedId(cliente.id);
    setValidationError(null);
    setValues(clienteToFormValues(cliente));
  }

  function handleDelete(cliente: Cliente) {
    setPendingDelete(cliente);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;

    await removeCliente.mutateAsync(pendingDelete.id);
    if (selectedId === pendingDelete.id) clearForm();
    setPendingDelete(null);
    setMessage('Cliente excluído com sucesso.');
  }

  function clearForm() {
    setValues({});
    setSelectedId(null);
    setValidationError(null);
  }

  return (
    <Box>
      {(clientes.isLoading || isSaving || isDeleting) && <CircularProgress size={24} />}

      {clientes.isError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Não foi possível carregar clientes da API neste momento.
        </Alert>
      )}

      {validationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError}
        </Alert>
      )}

      {clientes.data && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Clientes carregados da API: {clientes.data.length}
          </Typography>
          <ClienteList clientes={clientes.data} selectedId={selectedId} onSelect={handleSelect} onDelete={handleDelete} />
        </>
      )}

      <CrudPage form={form as GestorForm} values={values} onValueChange={handleValueChange} onAction={handleAction} />

      <Dialog open={pendingDelete !== null} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja excluir o cliente {pendingDelete?.nome ?? pendingDelete?.id}? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={isDeleting}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={message !== null} autoHideDuration={3000} message={message} onClose={() => setMessage(null)} />
    </Box>
  );
}

function clienteToFormValues(cliente: Cliente): FormValues {
  return {
    nome: cliente.nome,
    fantasia: cliente.fantasia,
    documento: cliente.documento,
    inscricaoEstadual: cliente.inscricaoEstadual,
    telefone: cliente.telefone,
    celular: cliente.celular,
    email: cliente.email,
    cep: cliente.cep,
    endereco: cliente.endereco,
    numero: cliente.numero,
    complemento: cliente.complemento,
    bairro: cliente.bairro,
    cidade: cliente.cidade,
    uf: cliente.uf,
    situacao: cliente.situacao,
    observacoes: cliente.observacoes
  };
}

function readApiError(error: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? 'Não foi possível gravar o cliente.';
  }

  return 'Não foi possível gravar o cliente.';
}
