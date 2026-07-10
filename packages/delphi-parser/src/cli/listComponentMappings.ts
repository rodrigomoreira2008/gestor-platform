import { listDelphiComponentMappings } from '../componentMapping';

const mappings = listDelphiComponentMappings()
  .sort((left, right) => left.delphiClass.localeCompare(right.delphiClass))
  .map((mapping) => ({
    delphiClass: mapping.delphiClass,
    role: mapping.role,
    frontendComponent: mapping.frontendComponent,
    notes: mapping.notes ?? ''
  }));

console.log(JSON.stringify({ total: mappings.length, mappings }, null, 2));
