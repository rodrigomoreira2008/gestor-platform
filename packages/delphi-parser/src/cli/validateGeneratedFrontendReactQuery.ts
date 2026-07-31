import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface CheckResult { name: string; ok: boolean; detail: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-react-query arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityCamel = entity.charAt(0).toLowerCase() + entity.slice(1);
const hooksFile = generated.find((file) => file.path.endsWith('/hooks/index.ts'));
const apiFile = generated.find((file) => file.path.endsWith('/api/index.ts'));
const diagnostics: string[] = [];
const checks: CheckResult[] = [];

function check(name: string, ok: boolean, detail: string): void {
  checks.push({ name, ok, detail });
  if (!ok) diagnostics.push(detail);
}

if (!hooksFile) {
  diagnostics.push('arquivo hooks/index.ts nao foi gerado');
} else {
  const content = hooksFile.content;
  const resourceFactory = `use${entity}Resource`;
  const resourceKeyMatch = content.match(new RegExp(`useCrudResource<${entity},\\s*${entity}Input>\\('([^']+)'`));
  const resourceKey = resourceKeyMatch?.[1] ?? null;

  check('shared-factory-import', content.includes("import { useCrudResource } from '../../../shared/crud/useCrudResource';"), 'hooks devem importar useCrudResource da infraestrutura compartilhada');
  check('typed-resource', content.includes(`useCrudResource<${entity}, ${entity}Input>`), `recurso deve usar os generics ${entity} e ${entity}Input`);
  check('stable-resource-key', Boolean(resourceKey && /^[a-z0-9-]+$/.test(resourceKey)), 'query key raiz deve ser uma chave estavel em kebab-case');
  check('single-resource-factory', (content.match(new RegExp(`function ${resourceFactory}\\(`, 'g')) ?? []).length === 1, `deve existir uma unica fabrica ${resourceFactory}`);
  check('list-hook', content.includes(`return ${resourceFactory}().list;`), `use${entity}s deve reutilizar o recurso compartilhado para listagem`);
  check('create-hook', content.includes(`return ${resourceFactory}().create;`), `useCreate${entity} deve reutilizar o recurso compartilhado para criacao`);
  check('update-hook', content.includes(`return ${resourceFactory}().update;`), `useUpdate${entity} deve reutilizar o recurso compartilhado para alteracao`);
  check('remove-hook', content.includes(`return ${resourceFactory}().remove;`), `useRemove${entity} deve reutilizar o recurso compartilhado para exclusao`);
  check('no-direct-react-query', !/@tanstack\/react-query/.test(content), 'hooks gerados nao devem acoplar diretamente ao TanStack Query');
  check('no-inline-query-keys', !/queryKey\s*:/.test(content), 'query keys nao devem ser duplicadas nos hooks gerados');
}

if (!apiFile) {
  diagnostics.push('arquivo api/index.ts nao foi gerado');
} else {
  const content = apiFile.content;
  check('crud-api-factory', content.includes('createCrudApi'), 'API gerada deve usar createCrudApi');
  check('resource-api-export', content.includes(`export const ${entityCamel}ResourceApi = api;`), `API deve exportar ${entityCamel}ResourceApi`);
}

const passed = checks.filter((item) => item.ok).length;
const ok = diagnostics.length === 0;
const runtimeMarker = ok ? `FRONTEND_REACT_QUERY_OK:${entity}:checks=${checks.length}:passed=${passed}` : null;
const report = {
  ok,
  entity,
  generatedFiles: generated.length,
  hooksFile: hooksFile?.path ?? null,
  apiFile: apiFile?.path ?? null,
  checks,
  passed,
  failed: checks.length - passed,
  runtimeMarker,
  diagnostics
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  if (runtimeMarker) console.log(runtimeMarker);
  for (const diagnostic of diagnostics) console.error(diagnostic);
}

if (!ok) process.exit(1);
