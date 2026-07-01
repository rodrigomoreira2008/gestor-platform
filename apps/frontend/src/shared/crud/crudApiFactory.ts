import { httpClient } from '../api/httpClient';

export interface CrudApi<TItem, TInput> {
  getAll: () => Promise<TItem[]>;
  getById: (id: number) => Promise<TItem>;
  create: (input: TInput) => Promise<TItem>;
  update: (id: number, input: TInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export function createCrudApi<TItem, TInput>(basePath: string): CrudApi<TItem, TInput> {
  return {
    async getAll() {
      const response = await httpClient.get<TItem[]>(basePath);
      return response.data;
    },

    async getById(id: number) {
      const response = await httpClient.get<TItem>(basePath + '/' + id);
      return response.data;
    },

    async create(input: TInput) {
      const response = await httpClient.post<TItem>(basePath, input);
      return response.data;
    },

    async update(id: number, input: TInput) {
      await httpClient.put(basePath + '/' + id, input);
    },

    async remove(id: number) {
      await httpClient.delete(basePath + '/' + id);
    }
  };
}
