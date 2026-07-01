import { createCrudApi } from '../../../shared/crud/crudApiFactory';
import type { Fornecedor, FornecedorInput } from '../types/fornecedor';

const api = createCrudApi<Fornecedor, FornecedorInput>('/api/fornecedores');

export const getFornecedores = api.getAll;
export const getFornecedor = api.getById;
export const createFornecedor = api.create;
export const updateFornecedor = api.update;
export const removeFornecedor = api.remove;
export const fornecedorResourceApi = api;
