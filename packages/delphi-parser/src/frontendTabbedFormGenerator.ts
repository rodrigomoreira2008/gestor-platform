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
  const tabs = normalizeTabs(input.tabs, input.fields);
  const tabPanels = tabs.map((tab, index) => renderTabPanel(tab, input.fields, index, input.entityPascal, input.entity)).join('\n');

  return `import { Box, Button, Checkbox, FormControlLabel, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { ${input.entityPascal}LookupField } from './${input.entityPascal}LookupField';
import type { ${input.entityPascal}Input } from '../types/${input.entity}';

interface ${input.entityPascal}TabbedFormProps {
  initialValue?: Partial<${input.entityPascal}Input>;
  onSubmit: (input: ${input.entityPascal}Input) => void;
  isSubmitting?: boolean;
}

function createInitialForm(initialValue?: Partial<${input.entityPascal}Input>): ${input.entityPascal}Input {
  return {
${input.fields.map((field) => `    ${toCamelCase(field.name)}: initialValue?.${toCamelCase(field.name)} ?? ${defaultValue(field)}`).join(',\n')}
  };
}

export function ${input.entityPascal}TabbedForm({ initialValue, onSubmit, isSubmitting }: ${input.entityPascal}TabbedFormProps) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState<${input.entityPascal}Input>(() => createInitialForm(initialValue));

  useEffect(() => {
    setForm(createInitialForm(initialValue));
    setTab(0);
  }, [initialValue]);

  const panels = useMemo(() => ${JSON.stringify(tabs.map((tab) => ({ name: tab.name, label: tab.label, fieldNames: tab.fieldNames, confidence: tab.confidence, evidence: tab.evidence })), null, 2)}, []);

  return (
    <Stack spacing={2} component="form" noValidate onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
      <Tabs
        value={tab}
        onChange={(_, value: number) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Seções do cadastro de ${escapeDoubleQuote(input.entityPascal)}"
      >
${tabs.map((tab, index) => `        <Tab id="${input.entity}-tab-${index}" aria-controls="${input.entity}-tabpanel-${index}" label="${escapeDoubleQuote(tab.label)}" />`).join('\n')}
      </Tabs>
${tabPanels}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
        <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
      </Box>
    </Stack>
  );
}
`;
}

function normalizeTabs(tabs: InferredTab[], fields: ResolvedField[]): InferredTab[] {
  const availableFields = new Set(fields.map((field) => field.name.toLowerCase()));
  const assigned = new Set<string>();
  const normalized = tabs
    .map((tab) => ({
      ...tab,
      fieldNames: tab.fieldNames.filter((fieldName) => {
        const key = fieldName.toLowerCase();
        if (!availableFields.has(key) || assigned.has(key)) return false;
        assigned.add(key);
        return true;
      })
    }))
    .filter((tab) => tab.fieldNames.length > 0);

  const remaining = fields.filter((field) => !assigned.has(field.name.toLowerCase())).map((field) => field.name);
  if (remaining.length > 0) {
    normalized.unshift({
      name: 'dadosGerais',
      label: normalized.length > 0 ? 'Dados gerais' : 'Dados',
      fieldNames: remaining,
      confidence: 'low',
      evidence: `${remaining.length} campo(s) sem aba valida foram preservados automaticamente.`
    });
  }

  return normalized.length > 0 ? normalized : [{
    name: 'dados',
    label: 'Dados',
    fieldNames: fields.map((field) => field.name),
    confidence: 'low',
    evidence: 'Fallback sem abas Delphi inferidas.'
  }];
}

function renderTabPanel(tab: InferredTab, fields: ResolvedField[], index: number, entityPascal: string, entity: string): string {
  const fieldControls = tab.fieldNames
    .map((fieldName) => fields.find((field) => field.name === fieldName))
    .filter((field): field is ResolvedField => Boolean(field))
    .map((field) => `            <Box key="${escapeDoubleQuote(field.name)}" sx={{ minWidth: 0 }}>\n${renderInput(field, entityPascal)}\n            </Box>`)
    .join('\n');

  return `      <Box
        role="tabpanel"
        hidden={tab !== ${index}}
        id="${entity}-tabpanel-${index}"
        aria-labelledby="${entity}-tab-${index}"
      >
        {tab === ${index} && (
          <Stack spacing={2} sx={{ py: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {panels[${index}]?.evidence}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
${fieldControls || '              <Typography variant="body2">Nenhum campo inferido para esta aba.</Typography>'}
            </Box>
          </Stack>
        )}
      </Box>`;
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
  return `              <FormControlLabel
                label="${label}"
                control={<Checkbox checked={Boolean(form.${name})} onChange={(event) => setForm((current) => ({ ...current, ${name}: event.target.checked as never }))} />}
              />`;
}

function renderLookup(field: ResolvedField, entityPascal: string): string {
  const name = toCamelCase(field.name);
  const label = escapeDoubleQuote(field.label ?? field.name);
  return `              <${entityPascal}LookupField
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
  const valueExpression = isNumber ? `form.${name} ?? ''` : `form.${name} ?? ''`;
  const changeExpression = isNumber ? `(event.target.value === '' ? undefined : Number(event.target.value)) as never` : 'event.target.value as never';
  return `              <TextField
                fullWidth
                label="${label}"
                type="${isDate ? 'date' : isNumber ? 'number' : 'text'}"
                value={${valueExpression}}
                required={${field.required ? 'true' : 'false'}}
                slotProps={${isDate ? "{ inputLabel: { shrink: true } }" : 'undefined'}}
                onChange={(event) => setForm((current) => ({ ...current, ${name}: ${changeExpression} }))}
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
