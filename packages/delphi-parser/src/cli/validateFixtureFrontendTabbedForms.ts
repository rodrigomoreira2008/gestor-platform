import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

interface FixtureCase { name: string; dfm: string; pas: string; entity: string; table: string; }
interface ValidatorCase { name: string; file: string; }

const fixtures: FixtureCase[] = [
  { name: 'produtos', dfm: 'fixtures/cadastro-produtos.dfm', pas: 'fixtures/cadastro-produtos.pas', entity: 'Produto', table: 'PRODUTOS' },
  { name: 'parceiros', dfm: 'fixtures/cadastro-parceiros.dfm', pas: 'fixtures/cadastro-parceiros.pas', entity: 'Parceiro', table: 'PARCEIROS' },
  { name: 'grupo-produtos', dfm: 'fixtures/cadastro-grupo-produtos.dfm', pas: 'fixtures/cadastro-grupo-produtos.pas', entity: 'GrupoProduto', table: 'GRUPOPRODUTOS' },
  { name: 'grupo-parceiros', dfm: 'fixtures/cadastro-grupo-parceiros.dfm', pas: 'fixtures/cadastro-grupo-parceiros.pas', entity: 'GrupoParceiro', table: 'GRUPOPARCEIROS' },
  { name: 'pedidos', dfm: 'fixtures/cadastro-pedidos.dfm', pas: 'fixtures/cadastro-pedidos.pas', entity: 'Pedido', table: 'PEDIDOS' }
];

const validators: ValidatorCase[] = [
  { name: 'manifest', file: 'src/cli/validateGeneratedFrontendManifest.ts' },
  { name: 'wiring', file: 'src/cli/validateGeneratedFrontendWiring.ts' },
  { name: 'consistency', file: 'src/cli/validateGeneratedFrontendConsistency.ts' },
  { name: 'localization', file: 'src/cli/validateGeneratedFrontendLocalization.ts' },
  { name: 'security', file: 'src/cli/validateGeneratedFrontendSecurity.ts' },
  { name: 'resilience', file: 'src/cli/validateGeneratedFrontendResilience.ts' },
  { name: 'complexity', file: 'src/cli/validateGeneratedFrontendComplexity.ts' },
  { name: 'performance', file: 'src/cli/validateGeneratedFrontendPerformance.ts' },
  { name: 'react-query', file: 'src/cli/validateGeneratedFrontendReactQuery.ts' },
  { name: 'state', file: 'src/cli/validateGeneratedFrontendState.ts' },
  { name: 'dirty-state', file: 'src/cli/validateGeneratedFrontendDirtyState.ts' },
  { name: 'mutations', file: 'src/cli/validateGeneratedFrontendMutations.ts' },
  { name: 'dialogs', file: 'src/cli/validateGeneratedFrontendDialogs.ts' },
  { name: 'pagination', file: 'src/cli/validateGeneratedFrontendPagination.ts' },
  { name: 'sorting', file: 'src/cli/validateGeneratedFrontendSorting.ts' },
  { name: 'selection', file: 'src/cli/validateGeneratedFrontendSelection.ts' },
  { name: 'search', file: 'src/cli/validateGeneratedFrontendSearch.ts' },
  { name: 'toolbar', file: 'src/cli/validateGeneratedFrontendToolbar.ts' },
  { name: 'empty-state', file: 'src/cli/validateGeneratedFrontendEmptyState.ts' },
  { name: 'csv-export', file: 'src/cli/validateGeneratedFrontendCsvExport.ts' },
  { name: 'filter-reset', file: 'src/cli/validateGeneratedFrontendFilterReset.ts' },
  { name: 'refresh', file: 'src/cli/validateGeneratedFrontendRefresh.ts' },
  { name: 'error-recovery', file: 'src/cli/validateGeneratedFrontendErrorRecovery.ts' },
  { name: 'active-filter-count', file: 'src/cli/validateGeneratedFrontendActiveFilterCount.ts' },
  { name: 'result-count', file: 'src/cli/validateGeneratedFrontendResultCount.ts' },
  { name: 'last-updated', file: 'src/cli/validateGeneratedFrontendLastUpdated.ts' },
  { name: 'background-loading', file: 'src/cli/validateGeneratedFrontendBackgroundLoading.ts' },
  { name: 'stale-data', file: 'src/cli/validateGeneratedFrontendStaleData.ts' },
  { name: 'paused-query', file: 'src/cli/validateGeneratedFrontendPausedQuery.ts' },
  { name: 'retry-indicator', file: 'src/cli/validateGeneratedFrontendRetryIndicator.ts' },
  { name: 'offline-refresh', file: 'src/cli/validateGeneratedFrontendOfflineRefresh.ts' },
  { name: 'query-status-announcement', file: 'src/cli/validateGeneratedFrontendQueryStatusAnnouncement.ts' },
  { name: 'offline-error-recovery', file: 'src/cli/validateGeneratedFrontendOfflineErrorRecovery.ts' },
  { name: 'initial-offline-state', file: 'src/cli/validateGeneratedFrontendInitialOfflineState.ts' },
  { name: 'offline-cached-data', file: 'src/cli/validateGeneratedFrontendOfflineCachedData.ts' },
  { name: 'offline-cache-age', file: 'src/cli/validateGeneratedFrontendOfflineCacheAge.ts' },
  { name: 'offline-cache-threshold', file: 'src/cli/validateGeneratedFrontendOfflineCacheThreshold.ts' },
  { name: 'offline-cache-timestamp', file: 'src/cli/validateGeneratedFrontendOfflineCacheTimestamp.ts' },
  { name: 'offline-cache-warning', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarning.ts' },
  { name: 'offline-cache-record-count', file: 'src/cli/validateGeneratedFrontendOfflineCacheRecordCount.ts' },
  { name: 'offline-cache-warning-dismiss', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningDismiss.ts' },
  { name: 'offline-cache-warning-rearm', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningRearm.ts' },
  { name: 'offline-cache-warning-snapshot-rearm', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningSnapshotRearm.ts' },
  { name: 'offline-cache-warning-session-dismiss', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningSessionDismiss.ts' },
  { name: 'offline-cache-warning-restore', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningRestore.ts' },
  { name: 'offline-cache-warning-restore-hint', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningRestoreHint.ts' },
  { name: 'offline-cache-warning-restore-focus', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningRestoreFocus.ts' },
  { name: 'offline-cache-warning-dismiss-focus', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningDismissFocus.ts' },
  { name: 'offline-cache-warning-escape-dismiss', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningEscapeDismiss.ts' },
  { name: 'offline-cache-warning-escape-shortcut', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningEscapeShortcut.ts' },
  { name: 'offline-cache-warning-escape-description', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningEscapeDescription.ts' },
  { name: 'offline-cache-warning-control-relation', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningControlRelation.ts' },
  { name: 'offline-cache-warning-action-label', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningActionLabel.ts' },
  { name: 'accessibility', file: 'src/cli/validateGeneratedFrontendAccessibility.ts' },
  { name: 'types', file: 'src/cli/validateGeneratedFrontendTypes.ts' },
  { name: 'navigation', file: 'src/cli/validateGeneratedFrontendNavigation.ts' },
  { name: 'tabbed-form', file: 'src/cli/validateGeneratedFrontendTabbedForm.ts' },
  { name: 'tabs', file: 'src/cli/validateGeneratedFrontendTabs.ts' },
  { name: 'filters', file: 'src/cli/validateGeneratedFrontendFilters.ts' },
  { name: 'columns', file: 'src/cli/validateGeneratedFrontendColumns.ts' },
  { name: 'detail-grids', file: 'src/cli/validateGeneratedFrontendDetailGrids.ts' },
  { name: 'detail-hooks', file: 'src/cli/validateGeneratedFrontendDetailHooks.ts' },
  { name: 'lookup-hooks', file: 'src/cli/validateGeneratedFrontendLookupHooks.ts' }
];

const packageRoot = process.cwd();
const json = process.argv.includes('--json');
const results: Array<{ fixture: string; contract: string; ok: boolean; exitCode: number | null; output: string }> = [];
for (const fixture of fixtures) {
  for (const validator of validators) {
    const args = ['exec', 'tsx', resolve(packageRoot, validator.file), resolve(packageRoot, fixture.dfm), resolve(packageRoot, fixture.pas), fixture.entity, fixture.table];
    if (json) args.push('--json');
    const execution = spawnSync('pnpm', args, { cwd: packageRoot, encoding: 'utf8', timeout: 15_000, shell: process.platform === 'win32' });
    const output = `${execution.stdout ?? ''}${execution.stderr ?? ''}`.trim();
    const ok = execution.status === 0;
    results.push({ fixture: fixture.name, contract: validator.name, ok, exitCode: execution.status, output });
    if (!json) { console.log(`\n[${ok ? 'OK' : 'ERRO'}] ${fixture.name} / ${validator.name}`); if (output) console.log(output); }
  }
}
const failed = results.filter((result) => !result.ok);
const report = { ok: failed.length === 0, fixtures: fixtures.length, contracts: validators.length, total: results.length, passed: results.length - failed.length, failed: failed.length, results };
if (json) console.log(JSON.stringify(report, null, 2));
else console.log(`\nResumo dos contratos frontend avancados: ${report.passed}/${report.total} execucoes OK`);
if (failed.length > 0) process.exit(1);
