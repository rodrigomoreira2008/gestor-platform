import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface Check { name: string; ok: boolean; detail: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-selection arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const pageFile = generated.find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const source = pageFile?.content ?? '';

const checks: Check[] = [
  { name: 'page-generated', ok: Boolean(pageFile), detail: `pages/${entityPascal}Page.tsx` },
  { name: 'selected-state', ok: source.includes(`const [selected, setSelected] = useState<${entityPascal} | null>(null)`), detail: 'estado selected tipado e anulavel' },
  { name: 'row-click-selection', ok: source.includes('onRowClick={({ row }) => setSelected(row)}'), detail: 'clique na linha atualiza selected' },
  { name: 'action-stop-propagation', ok: (source.match(/event\.stopPropagation\(\)/g) ?? []).length >= 2, detail: 'acoes editar/excluir nao alteram selecao por propagacao' },
  { name: 'selection-click-protection', ok: source.includes('disableRowSelectionOnClick'), detail: 'selecao nativa do grid desabilitada' },
  { name: 'detail-empty-state', ok: resolved.detailGrids.length === 0 || source.includes('Selecione um registro para carregar os detalhes.'), detail: 'estado vazio orienta selecao para detalhes' },
  { name: 'detail-selected-guard', ok: resolved.detailGrids.length === 0 || (source.includes('{!selected &&') && source.includes('{selected &&')), detail: 'detalhes condicionados ao registro selecionado' },
  { name: 'detail-hook-id', ok: resolved.detailGrids.length === 0 || source.includes('Details(selected?.id)'), detail: 'hooks de detalhe recebem selected?.id' },
  { name: 'delete-clears-selection', ok: source.includes('if (selected?.id === removing.id) setSelected(null)'), detail: 'exclusao limpa selecao correspondente' },
  { name: 'selection-not-array', ok: !source.includes(`useState<${entityPascal}[]>([]`) && !source.includes('selectedRows'), detail: 'contrato usa selecao unica' },
  { name: 'selection-stable-during-edit', ok: source.includes('setEditing(row)') && !source.includes('setSelected(null); setEditing'), detail: 'editar nao limpa selecao prematuramente' },
  { name: 'selection-stable-during-remove', ok: source.includes('setRemoving(row)') && !source.includes('setSelected(null); setRemoving'), detail: 'confirmacao de exclusao preserva selecao ate sucesso' }
];

const failed = checks.filter((check) => !check.ok);
const marker = failed.length === 0 ? `FRONTEND_SELECTION_OK:${entity}:checks=${checks.length}:passed=${checks.length}` : null;
const output = {
  ok: failed.length === 0,
  entity,
  pageFile: pageFile?.path ?? null,
  detailGrids: resolved.detailGrids.length,
  checks,
  failed: failed.map((check) => check.name),
  runtimeMarker: marker
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao de selecao do frontend gerado de ${entity}`);
  for (const check of checks) console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name}: ${check.detail}`);
  if (marker) console.log(marker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
