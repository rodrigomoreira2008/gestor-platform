import { listDelphiComponentMappings } from '../componentMapping';

const roleFilter = process.argv.slice(2).find((argument) => argument.startsWith('--role='))?.split('=')[1]?.trim().toLowerCase();
const searchFilter = process.argv.slice(2).find((argument) => argument.startsWith('--search='))?.split('=').slice(1).join('=').trim().toLowerCase();
const json = process.argv.includes('--json');

const allMappings = listDelphiComponentMappings();
const mappings = allMappings
  .filter((mapping) => !roleFilter || mapping.role.toLowerCase() === roleFilter)
  .filter((mapping) => !searchFilter || [mapping.delphiClass, mapping.role, mapping.frontendComponent, mapping.notes ?? ''].some((value) => value.toLowerCase().includes(searchFilter)))
  .sort((left, right) => left.delphiClass.localeCompare(right.delphiClass));

if (json) {
  console.log(JSON.stringify({ total: mappings.length, filters: { role: roleFilter ?? null, search: searchFilter ?? null }, mappings }, null, 2));
  process.exit(0);
}

console.log(`Componentes Delphi reconhecidos: ${mappings.length}/${allMappings.length}`);
for (const mapping of mappings) {
  const notes = mapping.notes ? ` - ${mapping.notes}` : '';
  console.log(`${mapping.delphiClass} => ${mapping.role} => ${mapping.frontendComponent}${notes}`);
}

if (mappings.length === 0) {
  console.error('Nenhum componente encontrado para os filtros informados.');
  process.exit(1);
}
