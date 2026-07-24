import type { GestorForm } from '@gestor/dsl';
import type { InferredBusinessRule } from './businessRuleInference';
import type { InferredDetailGrid } from './detailGridInference';
import type { InferredLookup } from './lookupInference';
import type { InferredSqlQuery } from './databaseInference';
import type { InferredRelationship } from './relationshipInference';
import type { InferredTab } from './tabInference';
import type { DelphiActionBinding, DelphiFieldBinding } from './types';
import type {
  PascalDatasetHint,
  PascalDependencyHint,
  PascalEventHint,
  PascalMethod,
  PascalMethodFlow,
  PascalRuleHint,
  PascalSqlSnippet,
  PascalValidationHint
} from './pasParser';

export interface ResolvedForm {
  form: GestorForm;
  fields: ResolvedField[];
  actions: ResolvedAction[];
  datasets: PascalDatasetHint[];
  queries: PascalSqlSnippet[];
  databaseQueries: InferredSqlQuery[];
  relationships: InferredRelationship[];
  lookups: InferredLookup[];
  tabs: InferredTab[];
  detailGrids: InferredDetailGrid[];
  validations: PascalValidationHint[];
  methods?: PascalMethod[];
  events?: PascalEventHint[];
  dependencies?: PascalDependencyHint[];
  rules?: PascalRuleHint[];
  methodFlows?: PascalMethodFlow[];
  businessRules?: InferredBusinessRule[];
  warnings: string[];
}

export interface ResolvedNumericConstraint {
  value: number;
  exclusive: boolean;
  message?: string;
  sourceNodeId: string;
}

export interface ResolvedField {
  name: string;
  label?: string;
  dataSource?: string;
  dataField?: string;
  section?: string;
  required: boolean;
  validationMessages: string[];
  numericMinimum?: ResolvedNumericConstraint;
  numericMaximum?: ResolvedNumericConstraint;
  source?: DelphiFieldBinding;
}

export interface ResolvedAction {
  name: string;
  label?: string;
  kind?: string;
  event?: PascalEventHint;
  source?: DelphiActionBinding;
}
