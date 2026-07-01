import { useCrudResource } from '../../../shared/crud/useCrudResource';
import { clienteApi } from '../api/clienteApi';
import type { Cliente, ClienteInput } from '../types/cliente';

export const clientesQueryKey = ['clientes'];

export function useClienteResource() {
  return useCrudResource<Cliente, ClienteInput>('clientes', clienteApi);
}

export function useClientes() {
  return useClienteResource().list;
}

export function useCreateCliente() {
  return useClienteResource().create;
}

export function useUpdateCliente() {
  return useClienteResource().update;
}

export function useRemoveCliente() {
  return useClienteResource().remove;
}
