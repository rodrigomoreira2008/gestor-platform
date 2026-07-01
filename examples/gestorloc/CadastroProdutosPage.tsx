import { CrudPage } from '@gestor/ui';
import type { GestorForm } from '@gestor/dsl';
import form from './cadastro-produtos.gestor.json';

export function CadastroProdutosPage() {
  return <CrudPage form={form as GestorForm} />;
}
