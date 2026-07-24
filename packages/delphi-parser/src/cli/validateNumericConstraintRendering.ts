import { renderCSharpNumericConstraints, renderZodNumericConstraints } from '../numericConstraintRendering';
import type { ResolvedField } from '../resolvedForm';

const field: ResolvedField = {
  name: 'DESCONTO',
  label: 'Desconto',
  required: false,
  validationMessages: ['Desconto deve estar entre 0 e 50'],
  numericMinimum: { value: 0, exclusive: false, message: 'Desconto deve ser no mínimo 0', sourceNodeId: 'Salvar:1' },
  numericMaximum: { value: 50, exclusive: false, message: 'Desconto deve ser no máximo 50', sourceNodeId: 'Salvar:2' }
};

const exclusiveField: ResolvedField = {
  name: 'VALOR',
  label: 'Valor',
  required: false,
  validationMessages: [],
  numericMinimum: { value: 0, exclusive: true, sourceNodeId: 'Salvar:3' }
};

const zod = renderZodNumericConstraints(field);
const csharp = renderCSharpNumericConstraints(field, 'Desconto').join('\n');
const exclusiveZod = renderZodNumericConstraints(exclusiveField);
const exclusiveCSharp = renderCSharpNumericConstraints(exclusiveField, 'Valor').join('\n');

const checks = [
  zod.includes('value >= 0'),
  zod.includes('value <= 50'),
  zod.includes('Desconto deve ser no mínimo 0'),
  zod.includes('Desconto deve ser no máximo 50'),
  csharp.includes('input.Desconto < 0'),
  csharp.includes('input.Desconto > 50'),
  exclusiveZod.includes('value > 0'),
  exclusiveCSharp.includes('input.Valor <= 0'),
  exclusiveCSharp.includes('Valor deve ser maior que 0.'),
  !zod.includes('undefined || value < 0')
];

const passed = checks.filter(Boolean).length;
const report = { ok: passed === checks.length, checks: checks.length, passed, zod, csharp, exclusiveZod, exclusiveCSharp };

if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else console.log(`NUMERIC_CONSTRAINT_RENDERING_${report.ok ? 'OK' : 'ERROR'}:checks=${checks.length}:passed=${passed}`);

if (!report.ok) process.exit(1);
