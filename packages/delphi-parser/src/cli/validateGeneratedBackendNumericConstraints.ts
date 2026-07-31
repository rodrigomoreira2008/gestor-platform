import { generateBackendFiles } from '../backendGenerator';
import type { ResolvedForm } from '../resolvedForm';

const resolved: ResolvedForm = {
  form: { entity: 'produto', title: 'Produto', fields: [], actions: [] } as ResolvedForm['form'],
  fields: [
    {
      name: 'VALOR',
      label: 'Valor',
      required: false,
      validationMessages: ['Valor deve ser maior que zero'],
      numericMinimum: { value: 0, exclusive: true, message: 'Valor deve ser maior que zero', sourceNodeId: 'save:1' }
    },
    {
      name: 'DESCONTO',
      label: 'Desconto',
      required: false,
      validationMessages: ['Desconto deve ser no máximo 50'],
      numericMaximum: { value: 50, exclusive: false, message: 'Desconto deve ser no máximo 50', sourceNodeId: 'save:2' }
    }
  ],
  actions: [],
  datasets: [],
  queries: [],
  databaseQueries: [],
  relationships: [],
  lookups: [],
  tabs: [],
  detailGrids: [],
  validations: [],
  warnings: []
};

const files = generateBackendFiles(resolved);
const validator = files.find((file) => file.path.endsWith('/Validators/ProdutoValidator.cs'))?.content ?? '';
const dto = files.find((file) => file.path.endsWith('/DTO/ProdutoDto.cs'))?.content ?? '';

const checks = [
  validator.includes('input.Valor <= 0'),
  validator.includes('Valor deve ser maior que zero'),
  validator.includes('input.Desconto > 50'),
  validator.includes('Desconto deve ser no máximo 50'),
  dto.includes('decimal? Valor'),
  dto.includes('decimal? Desconto'),
  !validator.includes('Regra Pascal para revisão manual em Valor'),
  !validator.includes('Regra Pascal para revisão manual em Desconto'),
  validator.includes('input.Valor is not null'),
  validator.includes('input.Desconto is not null')
];

const passed = checks.filter(Boolean).length;
const report = { ok: passed === checks.length, checks: checks.length, passed, validator, dto };

if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else console.log(`GENERATED_BACKEND_NUMERIC_CONSTRAINTS_${report.ok ? 'OK' : 'ERROR'}:checks=${checks.length}:passed=${passed}`);

if (!report.ok) process.exit(1);
