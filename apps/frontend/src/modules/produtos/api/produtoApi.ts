import { httpClient } from '../../../shared/api/httpClient';
import type { Produto, ProdutoInput } from '../types/produto';

const basePath = '/api/produtos';

export async function getProdutos(): Promise<Produto[]> {
  const response = await httpClient.get<Produto[]>(basePath);
  return response.data;
}

export async function getProduto(id: number): Promise<Produto> {
  const response = await httpClient.get<Produto>(basePath + '/' + id);
  return response.data;
}

export async function createProduto(input: ProdutoInput): Promise<Produto> {
  const response = await httpClient.post<Produto>(basePath, input);
  return response.data;
}

export async function updateProduto(id: number, input: ProdutoInput): Promise<void> {
  await httpClient.put(basePath + '/' + id, input);
}

export async function removeProduto(id: number): Promise<void> {
  await httpClient.delete(basePath + '/' + id);
}
