import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduto, getProdutos, removeProduto, updateProduto } from '../api/produtoApi';
import type { ProdutoInput } from '../types/produto';

export const produtosQueryKey = ['produtos'];

export function useProdutos() {
  return useQuery({
    queryKey: produtosQueryKey,
    queryFn: getProdutos
  });
}

export function useCreateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduto,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: produtosQueryKey });
    }
  });
}

export function useUpdateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProdutoInput }) => updateProduto(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: produtosQueryKey });
    }
  });
}

export function useRemoveProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeProduto,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: produtosQueryKey });
    }
  });
}
