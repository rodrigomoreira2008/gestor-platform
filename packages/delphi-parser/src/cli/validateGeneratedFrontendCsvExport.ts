import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface Check { name: string; ok: boolean; details: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-csv-export arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const pageFile = generated.find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const source = pageFile?.content ?? '';

const checks: Check[] = [
  { name: 'page-generated', ok: Boolean(pageFile), details: `pages/${entityPascal}Page.tsx` },
  { name: 'download-icon', ok: source.includes('Download') && source.includes('startIcon={<Download />}'), details: 'acao de exportacao possui icone semantico' },
  { name: 'export-handler', ok: source.includes('const exportCsv = () => {'), details: 'pagina declara manipulador de exportacao' },
  { name: 'filtered-rows-source', ok: source.includes('rows.map((row) =>'), details: 'CSV usa a colecao resultante de pesquisa e filtros' },
  { name: 'typed-fields', ok: source.includes('const exportFields =') && source.includes('as const;'), details: 'campos exportados sao definidos explicitamente' },
  { name: 'header-row', ok: source.includes('exportFields.map((field) => field.label).join(\';\')'), details: 'CSV possui cabecalho derivado dos campos' },
  { name: 'value-escaping', ok: source.includes('replace(/"/g, \'""\')') && source.includes('`"${value}"`'), details: 'valores sao protegidos por aspas e escape duplicado' },
  { name: 'semicolon-delimiter', ok: source.includes(".join(';')"), details: 'delimitador compativel com planilhas pt-BR' },
  { name: 'utf8-bom', ok: source.includes("'\\uFEFF' + csv"), details: 'arquivo inclui BOM UTF-8 para acentuacao' },
  { name: 'csv-blob', ok: source.includes("new Blob([") && source.includes("type: 'text/csv;charset=utf-8;'"), details: 'conteudo e criado como Blob CSV UTF-8' },
  { name: 'object-url', ok: source.includes('URL.createObjectURL(blob)') && source.includes('URL.revokeObjectURL(url)'), details: 'URL temporaria e liberada apos uso' },
  { name: 'download-filename', ok: source.includes(`link.download = '${entity.toLowerCase()}-export.csv';`), details: 'nome do arquivo identifica a entidade' },
  { name: 'disabled-empty', ok: source.includes('disabled={rows.length === 0 || list.isLoading}'), details: 'exportacao e bloqueada sem dados ou durante carregamento' },
  { name: 'toolbar-action', ok: source.includes('onClick={exportCsv}>Exportar CSV</Button>'), details: 'acao esta disponivel na toolbar' }
];

const failed = checks.filter((check) => !check.ok);
const runtimeMarker = failed.length === 0 ? `FRONTEND_CSV_EXPORT_OK:${entity}:checks=${checks.length}:passed=${checks.length}` : null;
const output = {
  ok: failed.length === 0,
  entity,
  pageFile: pageFile?.path ?? null,
  checks,
  runtimeMarker,
  diagnostics: failed.map((check) => `${check.name}: ${check.details}`)
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao da exportacao CSV frontend gerada de ${entity}`);
  for (const check of checks) console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name} - ${check.details}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
