import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CrudApi } from './crudApiFactory';

export function useCrudResource<TItem, TInput>(resourceKey: string, api: CrudApi<TItem, TInput>) {
  const queryClient = useQueryClient();
  const queryKey = [resourceKey];

  const list = useQuery({
    queryKey,
    queryFn: api.getAll
  });

  const create = useMutation({
    mutationFn: api.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    }
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: TInput }) => api.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    }
  });

  const remove = useMutation({
    mutationFn: api.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    }
  });

  return {
    queryKey,
    list,
    create,
    update,
    remove
  };
}
