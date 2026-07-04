import type { InferredLookup } from './lookupInference';

export function renderLookupAutocompleteComponent(entityPascal: string, entity: string, lookups: InferredLookup[]): string {
  const imports = lookups.map((lookup) => `use${toPascalCase(lookup.fieldName)}Lookup`).join(', ');
  const cases = lookups.map((lookup) => renderLookupCase(lookup)).join('\n');

  return `import { Autocomplete, TextField } from '@mui/material';
import type { UseQueryResult } from '@tanstack/react-query';
${imports ? `import { ${imports} } from '../lookups/${entity}LookupHooks';` : ''}
import type { LookupOption } from '../lookups/${entity}LookupHooks';

interface ${entityPascal}LookupFieldProps {
  fieldName: string;
  label: string;
  value?: string | number | null;
  required?: boolean;
  onChange: (value: string | number | null) => void;
}

interface LookupAutocompleteProps {
  label: string;
  value: string | number | null;
  required?: boolean;
  onChange: (value: string | number | null) => void;
  query: UseQueryResult<LookupOption[], Error>;
}

function LookupAutocomplete({ label, value, required, onChange, query }: LookupAutocompleteProps) {
  const options = query.data ?? [];
  const selected = options.find((option) => option.id === value) ?? null;

  return (
    <Autocomplete
      options={options}
      value={selected}
      loading={query.isLoading}
      getOptionLabel={(option) => option.label}
      onChange={(_, option) => onChange(option?.id ?? null)}
      renderInput={(params) => <TextField {...params} label={label} required={required} />}
    />
  );
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
