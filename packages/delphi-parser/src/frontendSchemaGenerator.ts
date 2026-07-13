import { mapDelphiComponent } from './componentMapping';
import type { ResolvedField } from './resolvedForm';

export function renderFrontendZodSchema(entityPascal: string, entity: string, fields: ResolvedField[]): string {
  const entries = fields
    .filter((field) => normalizeName(field.name) !== 'id')
    .map((field) => `  ${toCamelCase(field.name)}: ${renderFieldSchema(field)}`)
    .join(',\n');

  return `import { z } from 'zod';

const emptyStringToUndefined = (value: unknown) => value === '' ? undefined : value;

export const ${entity}Schema = z.object({
${entries}
});

export type ${entityPascal}FormData = z.infer<typeof ${entity}Schema>;
`;
}

function renderFieldSchema(field: ResolvedField): string {
  const type = inferType(field);
  const messages = uniqueMessages(field.validationMessages);
  const label = field.label ?? field.name;
  const requiredMessage = messages.find((message) => /obrigat|inform|preench|necessar/i.test(message)) ?? `${label} é obrigatório.`;

  if (type === 'boolean') {
    return field.required ? 'z.boolean()' : 'z.boolean().optional()';
  }

  if (type === 'number') {
    let inner = `z.coerce.number({ invalid_type_error: '${escapeSingleQuote(`${label} deve ser numérico.`)}' }).optional()`;
    if (messages.some((message) => /maior que zero|positivo|superior a zero/i.test(message))) {
      inner += `.refine((value) => value === undefined || value > 0, '${escapeSingleQuote(findMessage(messages, /maior que zero|positivo|superior a zero/i) ?? `${label} deve ser maior que zero.`)}')`;
    } else if (messages.some((message) => /não pode ser negativo|nao pode ser negativo|maior ou igual a zero/i.test(message))) {
      inner += `.refine((value) => value === undefined || value >= 0, '${escapeSingleQuote(findMessage(messages, /não pode ser negativo|nao pode ser negativo|maior ou igual a zero/i) ?? `${label} não pode ser negativo.`)}')`;
    }
    if (field.required) inner += `.refine((value) => value !== undefined, '${escapeSingleQuote(requiredMessage)}')`;
    return `z.preprocess(emptyStringToUndefined, ${inner})`;
  }

  let expression = 'z.string()';
  const maxLength = inferMaximumLength(messages);
  if (field.required) expression += `.trim().min(1, '${escapeSingleQuote(requiredMessage)}')`;
  if (maxLength) expression += `.max(${maxLength}, '${escapeSingleQuote(`${label} deve ter no máximo ${maxLength} caracteres.`)}')`;
  if (isEmailField(field, messages)) expression += `.email('${escapeSingleQuote(`${label} deve conter um e-mail válido.`)}')`;
  if (type === 'date') expression += `.refine((value) => value === '' || !Number.isNaN(Date.parse(value)), '${escapeSingleQuote(`${label} deve conter uma data válida.`)}')`;

  return field.required ? expression : `z.preprocess(emptyStringToUndefined, ${expression}.optional())`;
}

function inferType(field: ResolvedField): 'string' | 'number' | 'boolean' | 'date' {
  const mapping = mapDelphiComponent(field.source?.componentClass);
  const normalized = normalizeName(field.name);
  if (mapping.role === 'checkbox') return 'boolean';
  if (mapping.role === 'date' || normalized.includes('data')) return 'date';
  if (normalized.includes('valor') || normalized.includes('preco') || normalized.includes('total') || normalized.includes('quantidade') || normalized.includes('qtd') || normalized.endsWith('id') || normalized.includes('codigo')) return 'number';
  return 'string';
}

function inferMaximumLength(messages: string[]): number | undefined {
  for (const message of messages) {
    const match = message.match(/(?:máximo|maximo|até|ate)\s+(\d+)\s+caracter/i) ?? message.match(/(\d+)\s+caracter/i);
    if (match?.[1]) return Number.parseInt(match[1], 10);
  }
  return undefined;
}

function isEmailField(field: ResolvedField, messages: string[]): boolean {
  return /email|e-mail/i.test(field.name) || messages.some((message) => /email|e-mail/i.test(message));
}

function findMessage(messages: string[], pattern: RegExp): string | undefined {
  return messages.find((message) => pattern.test(message));
}

function uniqueMessages(messages: string[]): string[] {
  return Array.from(new Set(messages.map((message) => message.trim()).filter(Boolean)));
}

function normalizeName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function escapeSingleQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ');
}
