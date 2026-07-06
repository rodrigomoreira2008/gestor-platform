import type { GestorForm } from '@gestor/dsl';
import type { InferredDetailGrid } from './detailGridInference';
import type { InferredLookup } from './lookupInference';
import type { InferredSqlQuery } from './databaseInference';
import type { InferredRelationship } from './relationshipInference';
import type { InferredTab } from './tabInference';
import type { DelphiActionBinding, DelphiFieldBinding } from './types';
import type { PascalDatasetHint, PascalEventHint, PascalSqlSnippet, PascalValidationHint } from './pasParser';

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
  warnings: string[];
}

export interface ResolvedField {
  name: string;
  label?: string;
  dataSource?: string;
  dataField?: string;
  section?: string;
  required: boolean;
  validationMessages: string[];
  source?: DelphiFieldBinding;
}

export interface ResolvedAction {
  name: string;
  label?: string;
  kind?: string;
  event?: PascalEventHint;
  source?: DelphiActionBinding;
}
