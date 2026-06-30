export interface PasUnit {
  name: string;
  uses: string[];
  classes: PasClass[];
  procedures: PasProcedure[];
  functions: PasFunction[];
  sqlBlocks: PasSqlBlock[];
  warnings: string[];
}

export interface PasClass {
  name: string;
  ancestor?: string;
  methods: PasMethod[];
}

export interface PasMethod {
  name: string;
  kind: 'procedure' | 'function';
  owner?: string;
  parameters: string;
  body: string;
}

export interface PasProcedure {
  name: string;
  parameters: string;
  body: string;
}

export interface PasFunction {
  name: string;
  parameters: string;
  returnType?: string;
  body: string;
}

export interface PasSqlBlock {
  owner?: string;
  method?: string;
  text: string;
}
