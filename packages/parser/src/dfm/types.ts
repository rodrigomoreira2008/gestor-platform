export interface DfmComponent {
  name: string;
  className: string;
  properties: Record<string, string>;
  children: DfmComponent[];
}

export interface DfmParseResult {
  root: DfmComponent | null;
  components: DfmComponent[];
  warnings: string[];
}
