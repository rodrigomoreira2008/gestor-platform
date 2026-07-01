import { collectActionBindings, collectFieldBindings } from './dfmIntrospection';
import { dfmToGestorForm } from './dfmToGestorForm';
import { enrichGestorFormWithPascal } from './gestorPasEnrichment';
import { parseDfm } from './dfmParser';
import { parsePascalUnit } from './pasParser';
import type { PascalValidationHint } from './pasParser';
import type { ResolvedAction, ResolvedField, ResolvedForm } from './resolvedForm';

export interface ResolveFormOptions {
  entity: string;
  title?: string;
  dfmFile?: string;
  pasFile?: string;
  table?: string;
}

export function resolveDelphiForm(dfmInput: string, pasInput: string, options: ResolveFormOptions): ResolvedForm {
  const parsedDfm = parseDfm(dfmInput);
  if (!parsedDfm.root) throw new Error('DFM sem formulário raiz.');

  const pascal = parsePascalUnit(pasInput);
  const baseForm = dfmToGestorForm(dfmInput, options);
  const enriched = enrichGestorFormWithPascal(baseForm, pascal).form;
  const dfmFields = collectFieldBindings(parsedDfm.root);
  const dfmActions = collectActionBindings(parsedDfm.root);

  return {
    form: enriched,
    fields: dfmFields.map((field) => resolveField(field, pascal.validationHints)),
    actions: dfmActions.map((action) => {
      const event = pascal.eventHints.find((hint) => sameName(hint.componentName, action.componentName) || sameName(hint.handlerName, action.event ?? ''));
      return {
        name: action.componentName,
        label: action.caption,
        kind: inferActionKind(action.caption ?? action.componentName),
        event,
        source: action
      } satisfies ResolvedAction;
    }),
    datasets: pascal.datasetHints,
    queries: pascal.sqlSnippets,
    validations: pascal.validationHints,
    warnings: [...parsedDfm.warnings, ...pascal.warnings]
  };
}

function resolveField(field: ReturnType<typeof collectFieldBindings>[number], validations: PascalValidationHint[]): ResolvedField {
  const matchingValidations = validations.filter((validation) => validation.field && [field.dataField, field.componentName].some((candidate) => candidate && sameName(candidate, validation.field!)));

  return {
    name: field.dataField ?? field.componentName,
    label: field.label,
    dataSource: field.dataSource,
    dataField: field.dataField,
    section: field.section,
    required: matchingValidations.length > 0,
    validationMessages: matchingValidations.map((validation) => validation.message),
    source: field
  };
}

function inferActionKind(label: string): string {
  const normalized = normalizeName(label);
  if (normalized.includes('novo')) return 'create';
  if (normalized.includes('gravar') || normalized.includes('salvar') || normalized.includes('alterar')) return 'update';
  if (normalized.includes('excluir')) return 'delete';
  if (normalized.includes('imprimir')) return 'print';
  return 'custom';
}

function sameName(left: string, right: string): boolean {
  return normalizeName(left) === normalizeName(right);
}

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}
