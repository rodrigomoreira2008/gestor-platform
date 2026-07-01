import { createCrudApi } from '../../../shared/crud/crudApiFactory';
import type { Produto, ProdutoInput } from '../types/produto';

export const produtoApi = createCrudApi<Produto, ProdutoInput>('/api/produtos');

export const getProdutos = produtoApi.getAll;
export const getProduto = produtoApi.getById;
export const createProduto = produtoApi.create;
export const updateProduto = produtoApi.update;
export const removeProduto = produtoApi.remove;
