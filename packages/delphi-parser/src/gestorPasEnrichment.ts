import type { GestorForm } from '@gestor/dsl';
import type { PascalParseResult } from './pasParser';

export interface GestorPasEnrichmentResult {
  form: GestorForm;
  appliedValidations: number;
  notes: string[];
}

export function enrichGestorFormWithPascal(form: GestorForm, pascal: PascalParseResult): GestorPasEnrichmentResult {
  let appliedValidations = 0;
  const notes: string[] = [];
  const validationByField = new Map<string, string[]>();

  for (const hint of pascal.validationHints) {
    if (!hint.field) {
      notes.push(`Validação sem campo detectada em ${hint.methodName}: ${hint.message}`);
      continue;
    }

    const key = normalizeName(hint.field);
    const current = validationByField.get(key) ?? [];
    current.push(hint.message);
    validationByField.set(key, current);
  }

  const fields = form.fields.map((field) => {
    const keys = [field.name, field.sourceBinding].filter(Boolean).map((value) => normalizeName(String(value)));
    const messages = keys.flatMap((key) => validationByField.get(key) ?? []);

    if (messages.length === 0) return field;

    appliedValidations += 1;
    return {
      ...field,
      required: true,
      validationMessages: Array.from(new Set([...(field.validationMessages ?? []), ...messages]))
    };
  });

  const eventNotes = pascal.eventHints.map((event) => `Evento PAS: ${event.componentName}.${event.eventName} -> ${event.handlerName}`);
  const datasetNotes = pascal.datasetHints.map((dataset) => {
    const details = [dataset.className, dataset.tableName ? `tabela ${dataset.tableName}` : undefined, dataset.dataSource ? `dataset ${dataset.dataSource}` : undefined]
      .filter(Boolean)
      .join(', ');
    return `Dataset PAS: ${dataset.name} (${details})`;
  });

  return {
    form: {
      ...form,
      fields,
      notes: [...(form.notes ?? []), ...notes, ...eventNotes, ...datasetNotes]
    },
    appliedValidations,
    notes
  };
}

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}
