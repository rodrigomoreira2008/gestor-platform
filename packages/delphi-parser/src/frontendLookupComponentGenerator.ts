import type { InferredLookup } from './lookupInference';

export function renderLookupAutocompleteComponent(entityPascal: string, entity: string, lookups: InferredLookup[]): string {
  const imports = lookups.map((lookup) => `use${toPascalCase(lookup.fieldName)}Lookup`).join(', ');
  const cases = lookups.map((lookup) => renderLookupCase(lookup)).join('\n');

  return `import { Autocomplete, TextField } from '@mui/material';
import { ${imports} } from '../lookups/${entity}LookupHooks';

interface ${entityPascal}LookupFieldProps {
  fieldName: string;
  label: string;
  value?: string | number | null;
  required?: boolean;
  onChange: (value: string | number | null) => void;
}

export function ${entityPascal}LookupField(props: ${entityPascal}LookupFieldProps) {
  switch (props.fieldName) {
${cases || '    default:\n      return <TextField label={props.label} value={props.value ?? \'\'} required={props.required} disabled helperText="Lookup nao inferido." />;'}
    default:
      return <TextField label={props.label} value={props.value ?? ''} required={props.required} disabled helperText="Lookup nao inferido." />;
  }
}
`;
}

function renderLookupCase(lookup: InferredLookup): string {
  const hookName = `use${toPascalCase(lookup.fieldName)}Lookup`;
  return `    case '${escapeSingleQuote(lookup.fieldName)}':
      return <LookupAutocomplete label={props.label} value={props.value ?? null} required={props.required} onChange={props.onChange} query={${hookName}()} />;`;
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function escapeSingleQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
