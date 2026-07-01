export interface Cliente {
  id: number;
  nome?: string | null;
  fantasia?: string | null;
  documento?: string | null;
  inscricaoEstadual?: string | null;
  telefone?: string | null;
  celular?: string | null;
  email?: string | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  situacao?: string | null;
  observacoes?: string | null;
}

export type ClienteInput = Omit<Cliente, 'id'> & { id?: number };
