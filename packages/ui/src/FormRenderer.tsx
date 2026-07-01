import type { GestorField, GestorForm } from '@gestor/dsl';
import { Box, TextField, Typography } from '@mui/material';

export type FormValues = Record<string, unknown>;

export interface FormRendererProps {
  form: GestorForm;
  values?: FormValues;
  onChange?: (field: GestorField, value: unknown) => void;
}

export function FormRenderer({ form, values = {}, onChange }: FormRendererProps) {
  const sections = groupFieldsBySection(form.fields);

  return (
    <Box component="form" sx={{ display: 'grid', gap: 2 }}>
      {sections.map((section) => (
        <Box key={section.name} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
          {section.name !== 'Geral' && (
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              {section.name}
            </Typography>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {section.fields.map((field) => (
              <FieldRenderer key={field.name} field={field} value={values[field.name]} onChange={onChange} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function FieldRenderer({ field, value, onChange }: { field: GestorField; value: unknown; onChange?: (field: GestorField, value: unknown) => void }) {
  if (field.type === 'grid') {
    return (
      <Box sx={{ gridColumn: '1 / -1', border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 2 }}>
        <Typography variant="subtitle2">{field.label}</Typography>
      </Box>
    );
  }

  const commonProps = {
    label: field.label,
    name: field.name,
    fullWidth: true,
    required: field.required,
    disabled: field.readOnly,
    value: value ?? '',
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChange?.(field, coerceValue(field, event.target.value))
  };

  if (field.type === 'memo') {
    return <TextField {...commonProps} multiline minRows={4} sx={{ gridColumn: '1 / -1' }} />;
  }

  const type = field.type === 'date' ? 'date' : field.type === 'datetime' ? 'datetime-local' : field.type === 'integer' || field.type === 'decimal' || field.type === 'money' ? 'number' : 'text';
  const shrink = field.type === 'date' || field.type === 'datetime';

  return <TextField {...commonProps} type={type} InputLabelProps={shrink ? { shrink: true } : undefined} />;
}

function coerceValue(field: GestorField, value: string): unknown {
  if (value === '') return undefined;
  if (field.type === 'integer') return Number.parseInt(value, 10);
  if (field.type === 'decimal' || field.type === 'money') return Number.parseFloat(value);
  return value;
}

function groupFieldsBySection(fields: GestorField[]): Array<{ name: string; fields: GestorField[] }> {
  const map = new Map<string, GestorField[]>();

  for (const field of fields) {
    const section = field.section ?? 'Geral';
    map.set(section, [...(map.get(section) ?? []), field]);
  }

  return Array.from(map.entries()).map(([name, sectionFields]) => ({ name, fields: sectionFields }));
}
