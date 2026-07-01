export interface Produto {
  id: number;
  numero?: number | null;
  descricao?: string | null;
  marca?: string | null;
  grupo?: number | null;
  nomegrupo?: string | null;
  patrimonio?: string | null;
  numeroserie?: string | null;
  acessorio?: string | null;
  mostracontrato?: string | null;
  status?: string | null;
  valorcompra?: number | null;
  valorestimado?: number | null;
  valorlimpeza?: number | null;
  quantidadereal?: number | null;
  unidade?: string | null;
  quantidadeestoque?: number | null;
  valorminimo?: number | null;
  valormensal?: number | null;
  valordiario?: number | null;
  tipo?: string | null;
  tabeladescontomensal?: number | null;
  nometabeladescontomensal?: string | null;
  descricaodetalhada?: string | null;
  locacao?: number | null;
  nomelocacao?: string | null;
}

export type ProdutoInput = Omit<Produto, 'id'> & { id?: number };
