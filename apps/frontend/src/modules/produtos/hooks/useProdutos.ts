import { useCrudResource } from '../../../shared/crud/useCrudResource';
import { produtoApi } from '../api/produtoApi';
import type { Produto, ProdutoInput } from '../types/produto';

export const produtosQueryKey = ['produtos'];

export function useProdutoResource() {
  return useCrudResource<Produto, ProdutoInput>('produtos', produtoApi);
}

export function useProdutos() {
  return useProdutoResource().list;
}

export function useCreateProduto() {
  return useProdutoResource().create;
}

export function useUpdateProduto() {
  return useProdutoResource().update;
}

export function useRemoveProduto() {
  return useProdutoResource().remove;
}
