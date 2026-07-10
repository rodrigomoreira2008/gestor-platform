import { listDelphiComponentMappings } from '../componentMapping';

const mappings = listDelphiComponentMappings();
const normalizedClasses = mappings.map((mapping) => mapping.delphiClass.trim().toLowerCase());
const duplicateClasses = normalizedClasses.filter((value, index, values) => values.indexOf(value) !== index);
const emptyClasses = mappings.filter((mapping) => mapping.delphiClass.trim().length === 0);
const emptyFrontendComponents = mappings.filter((mapping) => mapping.frontendComponent.trim().length === 0);
const unknownMappings = mappings.filter((mapping) => mapping.role === 'unknown');
const invalidClassNames = mappings.filter((mapping) => !/^T[A-Za-z0-9_]+$/.test(mapping.delphiClass));

const issues = {
  duplicateClasses: [...new Set(duplicateClasses)],
  emptyClasses: emptyClasses.map((mapping) => mapping.delphiClass),
  emptyFrontendComponents: emptyFrontendComponents.map((mapping) => mapping.delphiClass),
  unknownMappings: unknownMappings.map((mapping) => mapping.delphiClass),
  invalidClassNames: invalidClassNames.map((mapping) => mapping.delphiClass)
};

const hasIssues = Object.values(issues).some((values) => values.length > 0);

if (hasIssues) {
  console.error(JSON.stringify(issues, null, 2));
  process.exit(1);
}

const byRole = mappings.reduce<Record<string, number>>((summary, mapping) => {
  summary[mapping.role] = (summary[mapping.role] ?? 0) + 1;
  return summary;
}, {});

console.log(JSON.stringify({ total: mappings.length, byRole }, null, 2));
