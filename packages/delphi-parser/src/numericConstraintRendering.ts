import type { ResolvedField, ResolvedNumericConstraint } from './resolvedForm';

export function renderZodNumericConstraints(field: ResolvedField): string {
  const parts: string[] = [];
  if (field.numericMinimum) parts.push(renderZodMinimum(field.label ?? field.name, field.numericMinimum));
  if (field.numericMaximum) parts.push(renderZodMaximum(field.label ?? field.name, field.numericMaximum));
  return parts.join('');
}

export function renderCSharpNumericConstraints(field: ResolvedField, propertyName: string): string[] {
  const rules: string[] = [];
  if (field.numericMinimum) {
    const operator = field.numericMinimum.exclusive ? '<=' : '<';
    rules.push(`        if (input.${propertyName} is not null && input.${propertyName} ${operator} ${formatNumber(field.numericMinimum.value)}) errors.Add("${escapeCSharp(field.numericMinimum.message ?? defaultMinimumMessage(field.label ?? propertyName, field.numericMinimum))}");`);
  }
  if (field.numericMaximum) {
    const operator = field.numericMaximum.exclusive ? '>=' : '>';
    rules.push(`        if (input.${propertyName} is not null && input.${propertyName} ${operator} ${formatNumber(field.numericMaximum.value)}) errors.Add("${escapeCSharp(field.numericMaximum.message ?? defaultMaximumMessage(field.label ?? propertyName, field.numericMaximum))}");`);
  }
  return rules;
}

function renderZodMinimum(label: string, constraint: ResolvedNumericConstraint): string {
  const operator = constraint.exclusive ? '>' : '>=';
  const message = constraint.message ?? defaultMinimumMessage(label, constraint);
  return `.refine((value) => value === undefined || value ${operator} ${formatNumber(constraint.value)}, '${escapeSingleQuote(message)}')`;
}

function renderZodMaximum(label: string, constraint: ResolvedNumericConstraint): string {
  const operator = constraint.exclusive ? '<' : '<=';
  const message = constraint.message ?? defaultMaximumMessage(label, constraint);
  return `.refine((value) => value === undefined || value ${operator} ${formatNumber(constraint.value)}, '${escapeSingleQuote(message)}')`;
}

function defaultMinimumMessage(label: string, constraint: ResolvedNumericConstraint): string {
  return `${label} deve ser ${constraint.exclusive ? 'maior que' : 'maior ou igual a'} ${formatNumber(constraint.value)}.`;
}

function defaultMaximumMessage(label: string, constraint: ResolvedNumericConstraint): string {
  return `${label} deve ser ${constraint.exclusive ? 'menor que' : 'menor ou igual a'} ${formatNumber(constraint.value)}.`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value).replace(',', '.');
}

function escapeSingleQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ');
}

function escapeCSharp(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ');
}
