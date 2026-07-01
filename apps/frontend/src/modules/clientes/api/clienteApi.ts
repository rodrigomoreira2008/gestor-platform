import { createCrudApi } from '../../../shared/crud/crudApiFactory';
import type { Cliente, ClienteInput } from '../types/cliente';

export const clienteApi = createCrudApi<Cliente, ClienteInput>('/api/clientes');

export const getClientes = clienteApi.getAll;
export const getCliente = clienteApi.getById;
export const createCliente = clienteApi.create;
export const updateCliente = clienteApi.update;
export const removeCliente = clienteApi.remove;
