import { generateFrontendFilterDefinitions } from './frontendFilterGenerator';
import type { ResolvedField } from './resolvedForm';

export function renderFrontendFilterComponent(entityPascal: string, entity: string, fields: ResolvedField[]): string {
  const definitions = generateFrontendFilterDefinitions(fields).slice(0, 8);
  const controls = definitions.map((filter) => renderControl(filter.name, filter.label, filter.kind)).join('\n');

  return `import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { ${entity}Filters } from '../filters/${entity}Filters';

export type ${entityPascal}FilterValue = string | number | boolean | null | undefined;
export type ${entityPascal}FilterValues = Partial<Record<(typeof ${entity}Filters)[number]['name'], ${entityPascal}FilterValue>>;

interface ${entityPascal}FiltersProps {
  value?: ${entityPascal}FilterValues;
  onChange: (value: ${entityPascal}FilterValues) => void;
  disabled?: boolean;
}

export function ${entityPascal}Filters({ value = {}, onChange, disabled }: ${entityPascal}FiltersProps) {
  const [draft, setDraft] = useState<${entityPascal}FilterValues>(value);

  useEffect(() => setDraft(value), [value]);

  function applyFilters() {
    const normalized = Object.fromEntries(Object.entries(draft).filter(([, current]) => current !== '' && current !== null && current !== undefined));
    onChange(normalized as ${entityPascal}FilterValues);
  }

  function clearFilters() {
    setDraft({});
    onChange({});
  }

  return (
    <Stack spacing={2} component="section" aria-label="Filtros avançados">
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} flexWrap="wrap" useFlexGap>
${controls || '        <TextField size="small" label="Nenhum filtro inferido" disabled />'}
      </Stack>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button onClick={clearFilters} disabled={disabled || Object.keys(draft).length === 0}>Limpar</Button>
        <Button variant="outlined" onClick={applyFilters} disabled={disabled}>Aplicar filtros</Button>
      </Stack>
    </Stack>
  );
}
`;
}

function renderControl(name: string, label: string, kind: 'text' | 'number' | 'date' | 'boolean' | 'lookup'): string {
  const safeLabel = escapeDoubleQuote(label);

  if (kind === 'boolean') {
    return `        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="filter-${name}-label">${safeLabel}</InputLabel>
          <Select
            labelId="filter-${name}-label"
            label="${safeLabel}"
            value={draft.${name} === undefined ? '' : String(draft.${name})}
            onChange={(event) => setDraft((current) => ({ ...current, ${name}: event.target.value === '' ? undefined : event.target.value === 'true' }))}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Sim</MenuItem>
            <MenuItem value="false">Não</MenuItem>
          </Select>
        </FormControl>`;
  }

  return `        <TextField
          size="small"
          label="${safeLabel}"
          type="${kind === 'date' ? 'date' : kind === 'number' ? 'number' : 'text'}"
          value={draft.${name} ?? ''}
          InputLabelProps={${kind === 'date' ? '{ shrink: true }' : 'undefined'}}
          onKeyDown={(event) => { if (event.key === 'Enter') applyFilters(); }}
          onChange={(event) => setDraft((current) => ({ ...current, ${name}: ${kind === 'number' ? "event.target.value === '' ? undefined : Number(event.target.value)" : 'event.target.value'} }))}
          sx={{ minWidth: 200, flex: '1 1 220px' }}
        />`;
}

function escapeDoubleQuote(value: string): string {
  return value.replace(/"/g, '&quot;');
}
