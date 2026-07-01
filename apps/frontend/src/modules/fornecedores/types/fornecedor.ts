export interface Fornecedor {
  id: number;
  razaoSocial?: string | null;
  fantasia?: string | null;
  documento?: string | null;
  inscricaoEstadual?: string | null;
  telefone?: string | null;
  celular?: string | null;
  email?: string | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  observacoes?: string | null;
}

export type FornecedorInput = Omit<Fornecedor, 'id'> & { id?: number };
