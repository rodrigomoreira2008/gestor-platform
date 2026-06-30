import type { GestorForm } from '@gestor/dsl';
import type { PasUnit } from '../pas/types.js';

export interface MigrationModuleReport {
  name: string;
  sources: {
    dfm?: string;
    pas?: string;
  };
  form?: GestorForm;
  pas?: PasUnit;
  summary: {
    fields: number;
    actions: number;
    classes: number;
    methods: number;
    sqlBlocks: number;
    warnings: number;
  };
  warnings: string[];
}
