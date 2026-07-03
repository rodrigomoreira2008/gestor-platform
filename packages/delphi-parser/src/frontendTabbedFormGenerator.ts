import type { ResolvedField } from './resolvedForm';
import type { InferredTab } from './tabInference';

export interface RenderTabbedFormInput {
  entityPascal: string;
  entity: string;
  fields: ResolvedField[];
  tabs: InferredTab[];
}

export function renderTabbedFormScaffold(input: RenderTabbedFormInput): string {
  const tabs = input.tabs.length > 0 ? input.tabs : [{ name: 'dados', label: 'Dados', fieldNames: input.fields.map((field) => field.name), confidence: 'low' as const, evidence: 'Fallback sem abas Delphi inferidas.' }];
  const tabPanels = tabs.map((tab, index) => renderTabPanel(tab, input.fields, index)).join('\n');

  return `import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { ${input.entityPascal}Form } from './${input.entityPascal}Form';
import type { ${input.entityPascal}Input } from '../types/${input.entity}';

interface ${input.entityPascal}TabbedFormProps {
  initialValue?: Partial<${input.entityPascal}Input>;
  onSubmit: (input: ${input.entityPascal}Input) => void;
  isSubmitting?: boolean;
}

export function ${input.entityPascal}TabbedForm(props: ${input.entityPascal}TabbedFormProps) {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
${tabs.map((tab) => `        <Tab label="${escapeDoubleQuote(tab.label)}" />`).join('\n')}
      </Tabs>
${tabPanels}
      <${input.entityPascal}Form {...props} />
    </Box>
  );
}
`;
}

function renderTabPanel(tab: InferredTab, fields: ResolvedField[], index: number): string {
  const labels = tab.fieldNames
    .map((fieldName) => fields.find((field) => field.name === fieldName)?.label ?? fieldName)
    .join(', ');

  return `      {tab === ${index} && <Box sx={{ py: 2 }} data-fields="${escapeDoubleQuote(labels)}" />}`;
}

function escapeDoubleQuote(value: string): string {
  return value.replace(/"/g, '&quot;');
}
