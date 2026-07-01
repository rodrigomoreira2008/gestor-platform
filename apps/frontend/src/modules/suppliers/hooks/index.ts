import { useCrudResource } from '../../../shared/crud/useCrudResource';
import { fornecedorResourceApi } from '../../fornecedores/api';
import type { Fornecedor, FornecedorInput } from '../../fornecedores/types/fornecedor';

function useSupplierResource() {
  return useCrudResource<Fornecedor, FornecedorInput>('supplier-list', fornecedorResourceApi);
}

export function useSuppliers() {
  return useSupplierResource().list;
}

export function useCreateSupplier() {
  return useSupplierResource().create;
}

export function useUpdateSupplier() {
  return useSupplierResource().update;
}

export function useRemoveSupplier() {
  return useSupplierResource().remove;
}
