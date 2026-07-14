import type { InferredLookup } from './lookupInference';

export function renderLookupAutocompleteComponent(entityPascal: string, entity: string, lookups: InferredLookup[]): string {
  const imports = lookups.map((lookup) => `use${toPascalCase(lookup.fieldName)}Lookup`).join(', ');
  const cases = lookups.map((lookup) => renderLookupCase(lookup)).join('\n');

  return `import { Alert, Autocomplete, CircularProgress, TextField } from '@mui/material';
import type { UseQueryResult } from '@tanstack/react-query';
${imports ? `import { ${imports} } from '../lookups/${entity}LookupHooks';` : ''}
import type { LookupOption } from '../lookups/${entity}LookupHooks';

interface ${entityPascal}LookupFieldProps {
  fieldName: string;
  label: string;
  value?: string | number | null;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  onChange: (value: string | number | null) => void;
}

interface LookupAutocompleteProps {
  label: string;
  value: string | number | null;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  onChange: (value: string | number | null) => void;
  query: UseQueryResult<LookupOption[], Error>;
}

function sameLookupValue(left: string | number | null | undefined, right: string | number | null | undefined) {
  if (left === null || left === undefined || right === null || right === undefined) return left === right;
  return String(left) === String(right);
}

function LookupAutocomplete({ label, value, required, disabled, error, helperText, onChange, query }: LookupAutocompleteProps) {
  const options = query.data ?? [];
  const selected = options.find((option) => sameLookupValue(option.id, value)) ?? null;

  if (query.isError) {
    return <Alert severity="warning">{query.error.message}</Alert>;
  }

  return (
    <Autocomplete
      options={options}
      value={selected}
      disabled={disabled}
      loading={query.isLoading || query.isFetching}
      loadingText="Carregando opções..."
      noOptionsText="Nenhuma opção encontrada"
      clearText="Limpar"
      openText="Abrir"
      closeText="Fechar"
      isOptionEqualToValue={(option, current) => sameLookupValue(option.id, current.id)}
      getOptionLabel={(option) => option.label}
      onChange={(_, option) => onChange(option?.id ?? null)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {(query.isLoading || query.isFetching) && <CircularProgress size={18} />}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
    />
  );
}

export function ${entityPascal}LookupField(props: ${entityPascal}LookupFieldProps) {
  switch (props.fieldName) {
${cases || '    default:\n      return <TextField label={props.label} value={props.value ?? \'\'} required={props.required} error={props.error} disabled helperText={props.helperText ?? "Lookup nao inferido."} />;'}
    default:
      return <TextField label={props.label} value={props.value ?? ''} required={props.required} error={props.error} disabled helperText={props.helperText ?? "Lookup nao inferido."} />;
  }
}
`;
}

function renderLookupCase(lookup: InferredLookup): string {
  const hookName = `use${toPascalCase(lookup.fieldName)}Lookup`;
  const helperText = lookup.confidence === 'high' ? undefined : `Inferência ${lookup.confidence}: ${lookup.evidence}`;
  return `    case '${escapeSingleQuote(lookup.fieldName)}':
      return <LookupAutocomplete label={props.label} value={props.value ?? null} required={props.required} disabled={props.disabled} error={props.error} helperText={props.helperText ?? ${helperText ? `'${escapeSingleQuote(helperText)}'` : 'undefined'}} onChange={props.onChange} query={${hookName}(!props.disabled)} />;`;
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function escapeSingleQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
