import { z } from 'zod';

export const gestorFieldTypeSchema = z.enum([
  'text',
  'integer',
  'decimal',
  'money',
  'date',
  'datetime',
  'boolean',
  'lookup',
  'memo',
  'grid'
]);

export const gestorFieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: gestorFieldTypeSchema,
  required: z.boolean().default(false),
  readOnly: z.boolean().default(false),
  sourceComponent: z.string().optional(),
  sourceBinding: z.string().optional(),
  lookup: z
    .object({
      entity: z.string().min(1),
      valueField: z.string().min(1),
      displayField: z.string().min(1)
    })
    .optional()
});

export const gestorActionSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  kind: z.enum(['create', 'update', 'delete', 'print', 'custom']),
  sourceEvent: z.string().optional()
});

export const gestorFormSchema = z.object({
  version: z.literal('0.1'),
  entity: z.string().min(1),
  title: z.string().min(1),
  source: z
    .object({
      dfm: z.string().optional(),
      pas: z.string().optional()
    })
    .optional(),
  table: z.string().optional(),
  fields: z.array(gestorFieldSchema).default([]),
  actions: z.array(gestorActionSchema).default([]),
  notes: z.array(z.string()).default([])
});

export type GestorFieldType = z.infer<typeof gestorFieldTypeSchema>;
export type GestorField = z.infer<typeof gestorFieldSchema>;
export type GestorAction = z.infer<typeof gestorActionSchema>;
export type GestorForm = z.infer<typeof gestorFormSchema>;

export function parseGestorForm(input: unknown): GestorForm {
  return gestorFormSchema.parse(input);
}
