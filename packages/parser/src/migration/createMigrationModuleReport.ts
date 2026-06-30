import type { GestorForm } from '@gestor/dsl';
import type { PasUnit } from '../pas/types.js';
import type { MigrationModuleReport } from './types.js';

export interface CreateMigrationModuleReportInput {
  name: string;
  dfmSource?: string;
  pasSource?: string;
  form?: GestorForm;
  pas?: PasUnit;
}

export function createMigrationModuleReport(input: CreateMigrationModuleReportInput): MigrationModuleReport {
  const formWarnings = input.form?.notes ?? [];
  const pasWarnings = input.pas?.warnings ?? [];
  const warnings = [...formWarnings, ...pasWarnings];
  const methods = input.pas?.classes.reduce((total, pasClass) => total + pasClass.methods.length, 0) ?? 0;

  return {
    name: input.name,
    sources: {
      dfm: input.dfmSource,
      pas: input.pasSource
    },
    form: input.form,
    pas: input.pas,
    summary: {
      fields: input.form?.fields.length ?? 0,
      actions: input.form?.actions.length ?? 0,
      classes: input.pas?.classes.length ?? 0,
      methods,
      sqlBlocks: input.pas?.sqlBlocks.length ?? 0,
      warnings: warnings.length
    },
    warnings
  };
}
