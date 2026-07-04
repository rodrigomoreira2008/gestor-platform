import { mapDelphiComponent } from './componentMapping';
import type { ResolvedField } from './resolvedForm';
import type { InferredTab } from './tabInference';

export interface RenderTabbedFormInput {
  entityPascal: string;
  entity: string;
  fields: ResolvedField[];
  tabs: InferredTab[];
}

export function renderTabbedFormScaffold(input: RenderTabbedFormInput): string {
  const tabs = input.tabs.length > 0 ? input.tabs : [{ name: 'dados', label: 'Dados', fieldNames: input.fields.map((field) => field.name), confidence: 'low' as const, evidence: 'Fallback sem abas Delphi inferidas.' }];
  const tabPanels = tabs.map((tab, index) => renderTabPanel(tab, input.fields, index, input.entityPascal)).join('\n');

  return `import { Button, Checkbox, FormControlLabel, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { ${input.entityPascal}LookupField } from './${input.entityPascal}LookupField';
import type { ${input.entityPascal}Input } from '../types/${input.entity}';

interface ${input.entityPascal}TabbedFormProps {
  initialValue?: Partial<${input.entityPascal}Input>;
  onSubmit: (input: ${input.entityPascal}Input) => void;
  isSubmitting?: boolean;
}

export function ${input.entityPascal}TabbedForm({ initialValue, onSubmit, isSubmitting }: ${input.entityPascal}TabbedFormProps) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState<${input.entityPascal}Input>({
${input.fields.map((field) => `    ${toCamelCase(field.name)}: initialValue?.${toCamelCase(field.name)} ?? ${defaultValue(field)}`).join(',\n')}
  });

  const panels = useMemo(() => ${JSON.stringify(tabs.map((tab) => ({ name: tab.name, label: tab.label, fieldNames: tab.fieldNames })), null, 2)}, []);

  return (
    <Stack spacing={2} component="form" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
${tabs.map((tab) => `        <Tab label="${escapeDoubleQuote(tab.label)}" />`).join('\n')}
      </Tabs>
${tabPanels}
      <Button type="submit" variant="contained" disabled={isSubmitting}>Salvar</Button>
    </Stack>
  );
}
`;
}

function renderTabPanel(tab: InferredTab, fields: ResolvedField[], index: number, entityPascal: string): string {
  const fieldControls = tab.fieldNames
    .map((fieldName) => fields.find((field) => field.name === fieldName))
    .filter((field): field is ResolvedField => Boolean(field))
    .map((field) => renderInput(field, entityPascal))
    .join('\n');

  return `      {tab === ${index} && (
        <Stack spacing={2} sx={{ py: 2 }}>
          <Typography variant="caption">Campos inferidos da aba: {panels[${index}]?.fieldNames.join(', ')}</Typography>
${fieldControls || '          <Typography variant="body2">Nenhum campo inferido para esta aba.</Typography>'}
        </Stack>
      )}`;
}

function renderInput(field: ResolvedField, entityPascal: string): string {
  const mapping = mapDelphiComponent(field.source?.componentClass);
  if (mapping.role === 'checkbox') return renderCheckbox(field);
  if (mapping.role === 'select') return renderLookup(field, entityPascal);
  return renderTextField(field, mapping.role === 'date');
}

function renderCheckbox(field: ResolvedField): string {
  const name = toCamelCase(field.name);
  const label = escapeDoubleQuote(field.label ?? field.name);
  return `          <FormControlLabel
            label="${label}"
            control={<Checkbox checked={Boolean(form.${name})} onChange={(event) => setForm((current) => ({ ...current, ${name}: event.target.checked as never }))} />}
          />`;
}

function renderLookup(field: ResolvedField, entityPascal: string): string {
  const name = toCamelCase(field.name);
  const label = escapeDoubleQuote(field.label ?? field.name);
  return `          <${entityPascal}LookupField
            fieldName="${escapeDoubleQuote(field.name)}"
            label="${label}"
            value={form.${name} as string | number | null | undefined}
            required={${field.required ? 'true' : 'false'}}
            onChange={(value) => setForm((current) => ({ ...current, ${name}: value as never }))}
          />`;
}

function renderTextField(field: ResolvedField, isDate: boolean): string {
  const name = toCamelCase(field.name);
  const label = escapeDoubleQuote(field.label ?? field.name);
  const isNumber = mapTsType(field) === 'number';
  return `          <TextField
            label="${label}"
            type="${isDate ? 'date' : isNumber ? 'number' : 'text'}"
            value={form.${name} ?? ''}
            required={${field.required ? 'true' : 'false'}}
            InputLabelProps={${isDate ? '{ shrink: true }' : 'undefined'}}
            onChange={(event) => setForm((current) => ({ ...current, ${name}: ${isNumber ? 'Number(event.target.value) as never' : 'event.target.value as never'} }))}
          />`;
}

function defaultValue(field: ResolvedField): string {
  const mapping = mapDelphiComponent(field.source?.componentClass);
  if (mapping.role === 'checkbox') return 'false as never';
  return mapTsType(field) === 'number' ? 'undefined' : "''";
}

function mapTsType(field: ResolvedField): string {
  const normalized = field.name.toLowerCase();
  if (normalized.includes('valor') || normalized.includes('preco') || normalized.includes('total')) return 'number';
  if (normalized.includes('quantidade') || normalized.includes('qtd')) return 'number';
  if (normalized === 'id' || normalized.endsWith('id') || normalized.includes('codigo')) return 'number';
  return 'string';
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function escapeDoubleQuote(value: string): string {
  return value.replace(/"/g, '&quot;');
}
