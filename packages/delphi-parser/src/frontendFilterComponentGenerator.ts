import type { ResolvedField } from './resolvedForm';

export function renderFrontendFilterComponent(entityPascal: string, entity: string, fields: ResolvedField[]): string {
  const textFields = fields
    .slice(0, 6)
    .map((field) => renderTextField(field))
    .join('\n');

  return `import { Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { ${entity}Filters } from '../filters/${entity}Filters';

export type ${entityPascal}FilterValues = Partial<Record<(typeof ${entity}Filters)[number]['name'], string>>;

interface ${entityPascal}FiltersProps {
  value?: ${entityPascal}FilterValues;
  onChange: (value: ${entityPascal}FilterValues) => void;
}

export function ${entityPascal}Filters({ value = {}, onChange }: ${entityPascal}FiltersProps) {
  const [draft, setDraft] = useState<${entityPascal}FilterValues>(value);

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
${textFields}
      <Button variant="outlined" onClick={() => onChange(draft)}>Filtrar</Button>
      <Button onClick={() => { setDraft({}); onChange({}); }}>Limpar</Button>
    </Stack>
  );
}
`;
}

function renderTextField(field: ResolvedField): string {
  const name = toCamelCase(field.name);
  const label = field.label ?? field.name;
  return `      <TextField
        size="small"
        label="${escapeDoubleQuote(label)}"
        value={draft.${name} ?? ''}
        onChange={(event) => setDraft((current) => ({ ...current, ${name}: event.target.value }))}
      />`;
}

function toPascalCase(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function escapeDoubleQuote(value: string): string {
  return value.replace(/"/g, '&quot;');
}
