import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateBackendFiles, generateFrontendFiles, resolveDelphiForm } from '../index';

interface Check {
  name: string;
  ok: boolean;
  detail: string;
}

const packageRoot = process.cwd();
const dfmPath = resolve(packageRoot, 'fixtures/cadastro-pedidos.dfm');
const pasPath = resolve(packageRoot, 'fixtures/cadastro-pedidos.pas');
const dfm = readFileSync(dfmPath, 'utf8');
const pas = readFileSync(pasPath, 'utf8');
const resolved = resolveDelphiForm(dfm, pas, { entity: 'Pedido', table: 'PEDIDOS' });
const frontendFiles = generateFrontendFiles(resolved);
const backendFiles = generateBackendFiles(resolved);
const checks: Check[] = [];

function normalize(value: string | undefined): string {
  return (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function hasGeneratedContent(files: Array<{ path: string; content: string }>, pathFragment: string, contentFragment: string): boolean {
  return files.some((file) => file.path.includes(pathFragment) && file.content.includes(contentFragment));
}

const fieldNames = new Set(resolved.fields.map((field) => normalize(field.name)));
for (const expected of ['NUMERO', 'DATA', 'CLIENTE_ID', 'VALOR_TOTAL']) {
  checks.push({
    name: `campo ${expected}`,
    ok: fieldNames.has(normalize(expected)),
    detail: resolved.fields.map((field) => field.name).join(', ')
  });
}

checks.push({
  name: 'abas do pedido inferidas',
  ok: resolved.tabs.length >= 2,
  detail: resolved.tabs.map((tab) => `${tab.label}:${tab.fieldNames.join('|')}`).join(', ')
});

const clienteLookup = resolved.lookups.find((lookup) => normalize(lookup.fieldName) === normalize('CLIENTE_ID'));
checks.push({
  name: 'lookup de cliente inferido',
  ok: Boolean(clienteLookup),
  detail: clienteLookup?.evidence ?? 'ausente'
});
checks.push({
  name: 'lookup de cliente completo',
  ok: clienteLookup?.confidence === 'high' && normalize(clienteLookup.keyField) === 'id' && normalize(clienteLookup.displayField) === 'nome',
  detail: clienteLookup ? `${clienteLookup.confidence}; ${clienteLookup.keyField}; ${clienteLookup.displayField}; ${clienteLookup.endpointHint}` : 'ausente'
});

const itemsGrid = resolved.detailGrids.find((grid) => normalize(grid.name).includes('item') || normalize(grid.dataSource).includes('item'));
checks.push({
  name: 'grid de itens inferido',
  ok: Boolean(itemsGrid),
  detail: itemsGrid?.evidence ?? 'ausente'
});
checks.push({
  name: 'relacao mestre detalhe do grid',
  ok: Boolean(itemsGrid?.masterField && itemsGrid?.detailField),
  detail: itemsGrid ? `${itemsGrid.masterField ?? '?'} -> ${itemsGrid.detailField ?? '?'}` : 'ausente'
});

const pedidoItemsRelationship = resolved.relationships.find((relationship) => {
  const tables = [normalize(relationship.dependentTable), normalize(relationship.principalTable), normalize(relationship.sourceTable), normalize(relationship.targetTable)];
  return tables.includes('pedidos') && tables.includes('itenspedido');
});
checks.push({
  name: 'relacionamento PEDIDOS ITENSPEDIDO',
  ok: Boolean(pedidoItemsRelationship),
  detail: pedidoItemsRelationship?.evidence ?? 'ausente'
});
checks.push({
  name: 'direcao da chave estrangeira',
  ok: normalize(pedidoItemsRelationship?.dependentTable) === 'itenspedido' && normalize(pedidoItemsRelationship?.dependentColumn) === 'pedidoid' && normalize(pedidoItemsRelationship?.principalTable) === 'pedidos',
  detail: pedidoItemsRelationship ? `${pedidoItemsRelationship.dependentTable}.${pedidoItemsRelationship.dependentColumn} -> ${pedidoItemsRelationship.principalTable}.${pedidoItemsRelationship.principalColumn}` : 'ausente'
});

const validationText = resolved.fields.flatMap((field) => field.validationMessages).join(' | ');
checks.push({
  name: 'validacao de valor positivo',
  ok: /maior que zero|positivo|superior a zero/i.test(validationText),
  detail: validationText || 'nenhuma mensagem'
});
checks.push({
  name: 'campos obrigatorios inferidos',
  ok: resolved.fields.filter((field) => field.required).length >= 2,
  detail: resolved.fields.filter((field) => field.required).map((field) => field.name).join(', ')
});

checks.push({
  name: 'schema frontend com regra positiva',
  ok: hasGeneratedContent(frontendFiles, '/schema/', 'value > 0'),
  detail: 'schema deve materializar a regra Pascal'
});
checks.push({
  name: 'formulario frontend validado por Zod',
  ok: hasGeneratedContent(frontendFiles, 'TabbedForm.tsx', '.safeParse(form)'),
  detail: 'TabbedForm deve validar antes de enviar'
});
checks.push({
  name: 'lookup frontend de cliente',
  ok: frontendFiles.some((file) => file.path.endsWith('LookupHooks.ts') && /Cliente.*Lookup|CLIENTE_ID|clienteId/i.test(file.content)),
  detail: 'hook de lookup deve ser gerado'
});
checks.push({
  name: 'grid frontend de itens',
  ok: frontendFiles.some((file) => file.path.endsWith('DetailGrid.tsx') && /itens|item/i.test(file.path + file.content)),
  detail: 'DataGrid detalhe deve ser gerado'
});
checks.push({
  name: 'backend com configuracao de relacionamento',
  ok: backendFiles.some((file) => /HasForeignKey|HasPrincipalKey/.test(file.content) && /PedidoId|PEDIDO_ID/i.test(file.content)),
  detail: 'configuracao EF Core deve conter a FK de itens'
});

const failed = checks.filter((check) => !check.ok);
const output = {
  ok: failed.length === 0,
  fixture: 'cadastro-pedidos',
  total: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  failures: failed.map((check) => check.name),
  summary: {
    fields: resolved.fields.length,
    tabs: resolved.tabs.length,
    lookups: resolved.lookups.length,
    detailGrids: resolved.detailGrids.length,
    relationships: resolved.relationships.length,
    frontendFiles: frontendFiles.length,
    backendFiles: backendFiles.length
  },
  checks
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log('Validacao semantica do fixture Cadastro de Pedidos');
  for (const check of checks) console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name}: ${check.detail}`);
  console.log(`Resumo: ${output.passed}/${output.total} verificacoes OK`);
  if (failed.length > 0) console.error(`Falhas: ${output.failures.join(', ')}`);
}

if (failed.length > 0) process.exit(1);
