import { readFileSync } from 'node:fs';
import { generateBackendFiles, generateFrontendFiles, resolveDelphiForm } from '../index';

interface RouteCheck {
  name: string;
  ok: boolean;
  detail: string;
}

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const [dfmPath, pasPath, entity, table] = args;
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:routes arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const backendFiles = generateBackendFiles(resolved);
const frontendFiles = generateFrontendFiles(resolved);
const checks: RouteCheck[] = [];

const controller = backendFiles.find((file) => /\/Controllers\/[^/]+Controller\.cs$/.test(file.path));
const api = frontendFiles.find((file) => /\/api\/index\.ts$/.test(file.path));
const routeSnippet = frontendFiles.find((file) => /\/Generated\/[^/]+Route\.tsx\.txt$/.test(file.path));
const menuSnippet = frontendFiles.find((file) => /\/Generated\/[^/]+MenuItem\.ts\.txt$/.test(file.path));

checks.push({ name: 'controller backend encontrado', ok: Boolean(controller), detail: controller?.path ?? 'ausente' });
checks.push({ name: 'API frontend encontrada', ok: Boolean(api), detail: api?.path ?? 'ausente' });
checks.push({ name: 'snippet de rota encontrado', ok: Boolean(routeSnippet), detail: routeSnippet?.path ?? 'ausente' });
checks.push({ name: 'snippet de menu encontrado', ok: Boolean(menuSnippet), detail: menuSnippet?.path ?? 'ausente' });

const backendRoute = controller?.content.match(/\[Route\("([^"]+)"\)\]/)?.[1];
const frontendRoute = api?.content.match(/createCrudApi<[^>]+>\('([^']+)'\)/)?.[1];
const pageRoute = routeSnippet?.content.match(/path:\s*'([^']+)'/)?.[1];
const menuRoute = menuSnippet?.content.match(/path:\s*'([^']+)'/)?.[1];

checks.push({ name: 'rota backend extraida', ok: Boolean(backendRoute), detail: backendRoute ?? 'ausente' });
checks.push({ name: 'rota API frontend extraida', ok: Boolean(frontendRoute), detail: frontendRoute ?? 'ausente' });
checks.push({ name: 'rota de pagina extraida', ok: Boolean(pageRoute), detail: pageRoute ?? 'ausente' });
checks.push({ name: 'rota de menu extraida', ok: Boolean(menuRoute), detail: menuRoute ?? 'ausente' });

if (backendRoute && frontendRoute) {
  const normalizedBackend = normalizeApiRoute(backendRoute);
  const normalizedFrontend = normalizeApiRoute(frontendRoute);
  checks.push({
    name: 'backend e frontend usam o mesmo endpoint CRUD',
    ok: normalizedBackend === normalizedFrontend,
    detail: `backend=${normalizedBackend}, frontend=${normalizedFrontend}`
  });
  checks.push({
    name: 'endpoint CRUD usa prefixo api',
    ok: normalizedBackend.startsWith('/api/'),
    detail: normalizedBackend
  });
  checks.push({
    name: 'endpoint CRUD sem barras duplicadas',
    ok: !normalizedBackend.includes('//'),
    detail: normalizedBackend
  });
}

if (pageRoute && menuRoute) {
  checks.push({
    name: 'rota da pagina corresponde ao menu',
    ok: normalizePageRoute(pageRoute) === normalizePageRoute(menuRoute),
    detail: `pagina=${pageRoute}, menu=${menuRoute}`
  });
  checks.push({
    name: 'rota da pagina nao aponta para API',
    ok: !normalizePageRoute(pageRoute).startsWith('/api/'),
    detail: pageRoute
  });
}

const failed = checks.filter((check) => !check.ok);
const output = {
  ok: failed.length === 0,
  entity,
  backendRoute: backendRoute ? normalizeApiRoute(backendRoute) : undefined,
  frontendRoute: frontendRoute ? normalizeApiRoute(frontendRoute) : undefined,
  pageRoute: pageRoute ? normalizePageRoute(pageRoute) : undefined,
  menuRoute: menuRoute ? normalizePageRoute(menuRoute) : undefined,
  total: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  failures: failed.map((check) => check.name),
  checks
};

if (json) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Validacao de rotas geradas para ${entity}`);
  for (const check of checks) console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name}: ${check.detail}`);
  console.log(`Resumo: ${output.passed}/${output.total} verificacoes OK`);
  if (failed.length > 0) console.error(`Falhas: ${output.failures.join(', ')}`);
}

if (failed.length > 0) process.exit(1);

function normalizeApiRoute(value: string): string {
  const normalized = `/${value}`.replace(/\\/g, '/').replace(/\/{2,}/g, '/').replace(/\/$/, '').toLowerCase();
  return normalized.startsWith('/api/') ? normalized : `/api/${normalized.replace(/^\//, '')}`;
}

function normalizePageRoute(value: string): string {
  return `/${value}`.replace(/\\/g, '/').replace(/\/{2,}/g, '/').replace(/\/$/, '').toLowerCase();
}
