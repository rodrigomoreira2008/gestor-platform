import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface Check { name: string; ok: boolean; detail: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-performance arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityCamel = entity.charAt(0).toLowerCase() + entity.slice(1);
const page = generated.find((file) => file.path.endsWith(`/pages/${entity}Page.tsx`));
const diagnostics: string[] = [];
const checks: Check[] = [];

function check(name: string, ok: boolean, detail: string): void {
  checks.push({ name, ok, detail });
  if (!ok) diagnostics.push(detail);
}

if (!page) {
  diagnostics.push(`pagina pages/${entity}Page.tsx nao foi gerada`);
} else {
  const content = page.content;
  check('useMemo-import', /import\s*\{[^}]*\buseMemo\b[^}]*\}\s*from\s*['"]react['"]/.test(content), 'pagina deve importar useMemo do React');
  check('rows-memoized', /const\s+rows\s*=\s*useMemo\s*\(/.test(content), 'colecao rows deve ser calculada com useMemo');
  check('columns-memoized', /const\s+columns\s*=\s*useMemo\s*</.test(content), 'colunas do DataGrid devem ser estabilizadas com useMemo');
  check('rows-dependencies', /\},\s*\[\s*filters\s*,\s*list\.data\s*,\s*search\s*\]\s*\)/.test(content), 'useMemo de rows deve depender de filters, list.data e search');
  check('columns-stable-dependencies', /const\s+columns[\s\S]*?\},\s*\[\s*\]\s*\)/.test(content), 'useMemo de columns deve possuir dependencias estaveis');
  check('server-data-reused', /const\s+data\s*=\s*list\.data\s*\?\?\s*\[\]/.test(content), 'list.data deve ser reutilizado sem copias desnecessarias antes da filtragem');
  check('bounded-page-sizes', /pageSizeOptions=\{\[10,\s*25,\s*50\]\}/.test(content), 'DataGrid deve limitar as opcoes de tamanho de pagina');
  check('bounded-default-page', /pageSize:\s*10/.test(content), 'DataGrid deve iniciar com pagina de tamanho limitado');
  check('single-filter-pass', /return\s+data\.filter\s*\(/.test(content), 'filtragem deve ocorrer em uma unica passagem sobre os dados');

  const inlineColumnDefinitions = (content.match(/columns=\{\s*\[/g) ?? []).length;
  check('no-inline-columns', inlineColumnDefinitions === 0, 'DataGrid nao deve receber array de colunas criado inline');

  const memoCount = (content.match(/\buseMemo\s*(?:<[^>]+>)?\s*\(/g) ?? []).length;
  check('minimum-memoization', memoCount >= 2, `pagina deve possuir ao menos 2 calculos memoizados; encontrados ${memoCount}`);
}

const passed = checks.filter((item) => item.ok).length;
const ok = diagnostics.length === 0;
const runtimeMarker = ok ? `FRONTEND_PERFORMANCE_OK:${entity}:checks=${checks.length}:memo=${checks.filter((item) => item.name.includes('memo') && item.ok).length}` : null;
const report = {
  ok,
  entity,
  generatedFiles: generated.length,
  pageFile: page?.path ?? null,
  checks: checks.length,
  passed,
  failed: checks.length - passed,
  runtimeMarker,
  results: checks,
  diagnostics
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  if (runtimeMarker) console.log(runtimeMarker);
  for (const diagnostic of diagnostics) console.error(diagnostic);
}

if (!ok) process.exit(1);
