import { generateBackendFiles } from '../backendGenerator';
import { enrichFieldsWithBusinessRules } from '../businessRuleFieldEnrichment';
import { renderFrontendZodSchema } from '../frontendSchemaGenerator';
import type { InferredBusinessRule } from '../businessRuleInference';
import type { ResolvedField, ResolvedForm } from '../resolvedForm';

const fields: ResolvedField[] = [
  {
    name: 'NOME',
    label: 'Nome',
    dataField: 'NOME',
    required: false,
    validationMessages: [],
    source: { componentName: 'edtNome', componentClass: 'TDBEdit', dataField: 'NOME' }
  }
];

const rules: InferredBusinessRule[] = [
  {
    methodName: 'btnGravarClick',
    kind: 'requiredField',
    confidence: 'high',
    sourceNodeId: 'btnGravarClick:1',
    field: 'edtNome',
    message: 'Informe o nome'
  }
];

const enrichment = enrichFieldsWithBusinessRules(fields, rules);
const frontend = renderFrontendZodSchema('Produto', 'produto', enrichment.fields);
const resolved = {
  form: { entity: 'Produto', title: 'Produtos', table: 'PRODUTOS', fields: [], actions: [] },
  fields: enrichment.fields,
  actions: [],
  datasets: [],
  queries: [],
  databaseQueries: [],
  relationships: [],
  lookups: [],
  tabs: [],
  detailGrids: [],
  validations: [],
  businessRules: rules,
  warnings: []
} as unknown as ResolvedForm;
const backend = generateBackendFiles(resolved).find((file) => file.path.endsWith('ProdutoValidator.cs'))?.content ?? '';

const checks = [
  enrichment.appliedRules === 1,
  enrichment.unmatchedRules.length === 0,
  enrichment.fields[0]?.required === true,
  enrichment.fields[0]?.validationMessages.includes('Informe o nome') === true,
  frontend.includes("nome: z.string().trim().min(1, 'Informe o nome')"),
  backend.includes('string.IsNullOrWhiteSpace(input.Nome)'),
  backend.includes('errors.Add("Informe o nome")'),
  !frontend.includes('nome: z.preprocess'),
  rules[0].sourceNodeId === 'btnGravarClick:1',
  resolved.warnings.length === 0
];

const passed = checks.filter(Boolean).length;
const report = { ok: passed === checks.length, checks: checks.length, passed, enrichment, frontend, backend };

if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else console.log(`BUSINESS_RULE_FIELD_ENRICHMENT_${report.ok ? 'OK' : 'ERROR'}:checks=${checks.length}:passed=${passed}`);

if (!report.ok) process.exit(1);
