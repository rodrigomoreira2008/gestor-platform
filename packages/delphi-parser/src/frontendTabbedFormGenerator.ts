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
  const fields = input.fields.filter((field) => normalizeName(field.name) !== 'id');
  const tabs = normalizeTabs(input.tabs, fields);
  const tabPanels = tabs.map((tab, index) => renderTabPanel(tab, fields, index, input.entityPascal, input.entity)).join('\n');

  return `import { Alert, Box, Button, Checkbox, FormControlLabel, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { ${input.entityPascal}LookupField } from './${input.entityPascal}LookupField';
import { ${input.entity}Schema } from '../schema/${input.entity}Schema';
import type { ${input.entityPascal}Input } from '../types/${input.entity}';

interface ${input.entityPascal}TabbedFormProps {
  initialValue?: Partial<${input.entityPascal}Input>;
  onSubmit: (input: ${input.entityPascal}Input) => void;
  isSubmitting?: boolean;
}

type FormErrors = Partial<Record<keyof ${input.entityPascal}Input, string>>;

function createInitialForm(initialValue?: Partial<${input.entityPascal}Input>): ${input.entityPascal}Input {
  return {
${fields.map((field) => `    ${toCamelCase(field.name)}: initialValue?.${toCamelCase(field.name)} ?? ${defaultValue(field)}`).join(',\n')}
  };
}

export function ${input.entityPascal}TabbedForm({ initialValue, onSubmit, isSubmitting }: ${input.entityPascal}TabbedFormProps) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState<${input.entityPascal}Input>(() => createInitialForm(initialValue));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setForm(createInitialForm(initialValue));
    setErrors({});
    setSubmitError(null);
    setTab(0);
  }, [initialValue]);

  const panels = useMemo(() => ${JSON.stringify(tabs.map((tab) => ({ name: tab.name, label: tab.label, fieldNames: tab.fieldNames, confidence: tab.confidence, evidence: tab.evidence })), null, 2)}, []);

  function updateField(name: keyof ${input.entityPascal}Input, value: unknown) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => current[name] ? ({ ...current, [name]: undefined }) : current);
    setSubmitError(null);
  }

  function handleSubmit() {
    const result = ${input.entity}Schema.safeParse(form);
    if (result.success) {
      setErrors({});
      setSubmitError(null);
      onSubmit(result.data as ${input.entityPascal}Input);
      return;
    }

    const nextErrors: FormErrors = {};
    for (const issue of result.error.issues) {
      const fieldName = issue.path[0] as keyof ${input.entityPascal}Input | undefined;
      if (fieldName && !nextErrors[fieldName]) nextErrors[fieldName] = issue.message;
    }
    setErrors(nextErrors);
    setSubmitError('Revise os campos destacados antes de salvar.');

    const firstInvalidField = Object.keys(nextErrors)[0];
    const invalidTab = panels.findIndex((panel) => panel.fieldNames.some((fieldName) => fieldName.toLocaleLowerCase('pt-BR') === firstInvalidField?.toLocaleLowerCase('pt-BR')));
    if (invalidTab >= 0) setTab(invalidTab);
  }

  return (
    <Stack spacing={2} component="form" noValidate onSubmit={(event) => { event.preventDefault(); handleSubmit(); }}>
      <Tabs
        value={tab}
        onChange={(_, value: number) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Seções do cadastro de ${escapeDoubleQuote(input.entityPascal)}"
      >
${tabs.map((tab, index) => `        <Tab id="${input.entity}-tab-${index}" aria-controls="${input.entity}-tabpanel-${index}" label="${escapeDoubleQuote(tab.label)}" />`).join('\n')}
      </Tabs>
      {submitError && <Alert severity="warning">{submitError}</Alert>}
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
  return `              <Stack spacing={0.5}>
                <FormControlLabel
                  label="${label}"
                  control={<Checkbox checked={Boolean(form.${name})} onChange={(event) => updateField('${name}', event.target.checked)} />}
                />
                {errors.${name} && <Typography variant="caption" color="error">{errors.${name}}</Typography>}
              </Stack>`;
}

function renderLookup(field: ResolvedField, entityPascal: string): string {
  const name = toCamelCase(field.name);
  const label = escapeDoubleQuote(field.label ?? field.name);
  return `              <${entityPascal}LookupField
                fieldName="${escapeDoubleQuote(field.name)}"
                label="${label}"
                value={form.${name} as string | number | null | undefined}
                required={${field.required ? 'true' : 'false'}}
                error={Boolean(errors.${name})}
                helperText={errors.${name}}
                onChange={(value) => updateField('${name}', value)}
              />`;
}

function renderTextField(field: ResolvedField, isDate: boolean): string {
  const name = toCamelCase(field.name);
  const label = escapeDoubleQuote(field.label ?? field.name);
  const isNumber = mapTsType(field) === 'number';
  const changeExpression = isNumber ? "event.target.value === '' ? undefined : Number(event.target.value)" : 'event.target.value';
  return `              <TextField
                fullWidth
                label="${label}"
                type="${isDate ? 'date' : isNumber ? 'number' : 'text'}"
                value={form.${name} ?? ''}
                required={${field.required ? 'true' : 'false'}}
                error={Boolean(errors.${name})}
                helperText={errors.${name}}
                slotProps={${isDate ? "{ inputLabel: { shrink: true } }" : 'undefined'}}
                onChange={(event) => updateField('${name}', ${changeExpression})}
              />`;
}

function defaultValue(field: ResolvedField): string {
  const mapping = mapDelphiComponent(field.source?.componentClass);
  if (mapping.role === 'checkbox') return 'false';
  return mapTsType(field) === 'number' ? 'undefined' : "''";
}

function mapTsType(field: ResolvedField): string {
  const normalized = normalizeName(field.name);
  if (normalized.includes('valor') || normalized.includes('preco') || normalized.includes('total')) return 'number';
  if (normalized.includes('quantidade') || normalized.includes('qtd')) return 'number';
  if (normalized === 'id' || normalized.endsWith('id') || normalized.includes('codigo')) return 'number';
  return 'string';
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

function escapeDoubleQuote(value: string): string {
  return value.replace(/"/g, '&quot;');
}
