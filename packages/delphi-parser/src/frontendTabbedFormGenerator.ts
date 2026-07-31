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

  return `import { Alert, Badge, Box, Button, Checkbox, FormControlLabel, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ${input.entityPascal}LookupField } from './${input.entityPascal}LookupField';
import { ${input.entity}Schema } from '../schema/${input.entity}Schema';
import type { ${input.entityPascal}Input } from '../types/${input.entity}';

interface ${input.entityPascal}TabbedFormProps {
  initialValue?: Partial<${input.entityPascal}Input>;
  onSubmit: (input: ${input.entityPascal}Input) => void;
  onDirtyChange?: (dirty: boolean) => void;
  isSubmitting?: boolean;
  warnOnUnsavedChanges?: boolean;
}

type FormErrors = Partial<Record<keyof ${input.entityPascal}Input, string>>;

function createInitialForm(initialValue?: Partial<${input.entityPascal}Input>): ${input.entityPascal}Input {
  return {
${fields.map((field) => `    ${toCamelCase(field.name)}: initialValue?.${toCamelCase(field.name)} ?? ${defaultValue(field)}`).join(',\n')}
  };
}

function serializeForm(value: ${input.entityPascal}Input): string {
  return JSON.stringify(value);
}

export function ${input.entityPascal}TabbedForm({ initialValue, onSubmit, onDirtyChange, isSubmitting, warnOnUnsavedChanges = true }: ${input.entityPascal}TabbedFormProps) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState<${input.entityPascal}Input>(() => createInitialForm(initialValue));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const pendingFocusField = useRef<string | null>(null);
  const baselineRef = useRef(serializeForm(createInitialForm(initialValue)));

  useEffect(() => {
    const nextForm = createInitialForm(initialValue);
    baselineRef.current = serializeForm(nextForm);
    setForm(nextForm);
    setErrors({});
    setSubmitError(null);
    pendingFocusField.current = null;
    setTab(0);
  }, [initialValue]);

  const panels = useMemo(() => ${JSON.stringify(tabs.map((tab) => ({ name: tab.name, label: tab.label, fieldNames: tab.fieldNames, confidence: tab.confidence, evidence: tab.evidence })), null, 2)}, []);
  const tabErrorCounts = useMemo(() => panels.map((panel) => panel.fieldNames.reduce((count, fieldName) => count + (errors[fieldName as keyof ${input.entityPascal}Input] ? 1 : 0), 0)), [errors, panels]);
  const isDirty = useMemo(() => serializeForm(form) !== baselineRef.current, [form]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!warnOnUnsavedChanges || !isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, warnOnUnsavedChanges]);

  useEffect(() => {
    const fieldName = pendingFocusField.current;
    if (!fieldName) return;
    const element = document.querySelector<HTMLElement>(`[data-field-name="${'${fieldName}'}"] input, [data-field-name="${'${fieldName}'}"] button, [data-field-name="${'${fieldName}'}"] [tabindex="0"]`);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      pendingFocusField.current = null;
    }
  }, [tab]);

  function updateField(name: keyof ${input.entityPascal}Input, value: unknown) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => current[name] ? ({ ...current, [name]: undefined }) : current);
    setSubmitError(null);
  }

  function resetForm() {
    const nextForm = createInitialForm(initialValue);
    baselineRef.current = serializeForm(nextForm);
    setForm(nextForm);
    setErrors({});
    setSubmitError(null);
    pendingFocusField.current = null;
    setTab(0);
  }

  function handleSubmit() {
    const result = ${input.entity}Schema.safeParse(form);
    if (result.success) {
      const normalized = result.data as ${input.entityPascal}Input;
      baselineRef.current = serializeForm(normalized);
      setForm(normalized);
      setErrors({});
      setSubmitError(null);
      pendingFocusField.current = null;
      onSubmit(normalized);
      return;
    }

    const nextErrors: FormErrors = {};
    for (const issue of result.error.issues) {
      const fieldName = issue.path[0] as keyof ${input.entityPascal}Input | undefined;
      if (fieldName && !nextErrors[fieldName]) nextErrors[fieldName] = issue.message;
    }
    setErrors(nextErrors);
    setSubmitError(`Revise os ${'${Object.keys(nextErrors).length}'} campo(s) destacado(s) antes de salvar.`);

    const firstInvalidField = Object.keys(nextErrors)[0];
    if (!firstInvalidField) return;
    pendingFocusField.current = firstInvalidField;
    const invalidTab = panels.findIndex((panel) => panel.fieldNames.some((fieldName) => fieldName.toLocaleLowerCase('pt-BR') === firstInvalidField.toLocaleLowerCase('pt-BR')));
    if (invalidTab >= 0 && invalidTab !== tab) setTab(invalidTab);
    else requestAnimationFrame(() => {
      const element = document.querySelector<HTMLElement>(`[data-field-name="${'${firstInvalidField}'}"] input, [data-field-name="${'${firstInvalidField}'}"] button, [data-field-name="${'${firstInvalidField}'}"] [tabindex="0"]`);
      element?.focus();
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      pendingFocusField.current = null;
    });
  }

  return (
    <Stack spacing={2} component="form" noValidate aria-describedby={submitError ? '${input.entity}-form-error' : undefined} onSubmit={(event) => { event.preventDefault(); handleSubmit(); }}>
      <Tabs
        value={tab}
        onChange={(_, value: number) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Seções do cadastro de ${escapeDoubleQuote(input.entityPascal)}"
      >
${tabs.map((tab, index) => `        <Tab id="${input.entity}-tab-${index}" aria-controls="${input.entity}-tabpanel-${index}" label={<Badge color="error" badgeContent={tabErrorCounts[${index}]} invisible={!tabErrorCounts[${index}]}><Box component="span" sx={{ pr: tabErrorCounts[${index}] ? 1 : 0 }}>${escapeDoubleQuote(tab.label)}</Box></Badge>} />`).join('\n')}
      </Tabs>
      {submitError && <Alert id="${input.entity}-form-error" severity="warning" role="alert">{submitError}</Alert>}
${tabPanels}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, pt: 1 }}>
        <Typography variant="caption" color={isDirty ? 'warning.main' : 'text.secondary'} aria-live="polite">
          {isDirty ? 'Existem alterações não salvas.' : 'Nenhuma alteração pendente.'}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button type="button" variant="text" disabled={!isDirty || isSubmitting} onClick={resetForm}>Restaurar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting} aria-busy={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
        </Stack>
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
    .map((field) => `            <Box key="${escapeDoubleQuote(field.name)}" data-field-name="${escapeDoubleQuote(toCamelCase(field.name))}" sx={{ minWidth: 0 }}>\n${renderInput(field, entityPascal)}\n            </Box>`)
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
                  control={<Checkbox checked={Boolean(form.${name})} inputProps={{ 'aria-invalid': Boolean(errors.${name}), 'aria-describedby': errors.${name} ? '${name}-error' : undefined }} onChange={(event) => updateField('${name}', event.target.checked)} />}
                />
                {errors.${name} && <Typography id="${name}-error" variant="caption" color="error" role="alert">{errors.${name}}</Typography>}
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
                slotProps={{ input: { 'aria-invalid': Boolean(errors.${name}), 'aria-describedby': errors.${name} ? '${name}-helper-text' : undefined }${isDate ? ", inputLabel: { shrink: true }" : ''} }}
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
