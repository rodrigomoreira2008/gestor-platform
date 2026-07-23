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
  { name: 'offline-cache-warning-pressed-state', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningPressedState.ts' },
  { name: 'offline-cache-warning-live-state', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningLiveState.ts' },
  { name: 'offline-cache-warning-live-relevant', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningLiveRelevant.ts' },
  { name: 'offline-cache-warning-state-description', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningStateDescription.ts' },
  { name: 'offline-cache-warning-button-role', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningButtonRole.ts' },
  { name: 'offline-cache-warning-keyboard-activation', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningKeyboardActivation.ts' },
  { name: 'offline-cache-warning-keyboard-shortcuts', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningKeyboardShortcuts.ts' },
  { name: 'offline-cache-warning-disabled-state', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningDisabledState.ts' },
  { name: 'offline-cache-warning-shortcut-availability', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningShortcutAvailability.ts' },
  { name: 'offline-cache-warning-focus-visible', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFocusVisible.ts' },
  { name: 'offline-cache-warning-interaction-feedback', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningInteractionFeedback.ts' },
  { name: 'offline-cache-warning-reduced-motion', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningReducedMotion.ts' },
  { name: 'offline-cache-warning-forced-colors', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningForcedColors.ts' },
  { name: 'offline-cache-warning-touch-target', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTouchTarget.ts' },
  { name: 'offline-cache-warning-scroll-margin', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningScrollMargin.ts' },
  { name: 'offline-cache-warning-text-reflow', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextReflow.ts' },
  { name: 'offline-cache-warning-text-spacing', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextSpacing.ts' },
  { name: 'offline-cache-warning-text-hyphenation', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextHyphenation.ts' },
  { name: 'offline-cache-warning-language', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningLanguage.ts' },
  { name: 'offline-cache-warning-direction', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningDirection.ts' },
  { name: 'offline-cache-warning-bidi-isolation', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningBidiIsolation.ts' },
  { name: 'offline-cache-warning-text-balance', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextBalance.ts' },
  { name: 'offline-cache-warning-no-truncation', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningNoTruncation.ts' },
  { name: 'offline-cache-warning-flex-reflow', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFlexReflow.ts' },
  { name: 'offline-cache-warning-box-sizing', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningBoxSizing.ts' },
  { name: 'offline-cache-warning-logical-sizing', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningLogicalSizing.ts' },
  { name: 'offline-cache-warning-logical-min-sizing', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningLogicalMinSizing.ts' },
  { name: 'offline-cache-warning-logical-text-align', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningLogicalTextAlign.ts' },
  { name: 'offline-cache-warning-word-break', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningWordBreak.ts' },
  { name: 'offline-cache-warning-hanging-punctuation', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningHangingPunctuation.ts' },
  { name: 'offline-cache-warning-font-kerning', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontKerning.ts' },
  { name: 'offline-cache-warning-font-ligatures', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontLigatures.ts' },
  { name: 'offline-cache-warning-font-numeric', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontNumeric.ts' },
  { name: 'offline-cache-warning-font-caps', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontCaps.ts' },
  { name: 'offline-cache-warning-font-east-asian', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontEastAsian.ts' },
  { name: 'offline-cache-warning-font-position', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontPosition.ts' },
  { name: 'offline-cache-warning-font-alternates', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontAlternates.ts' },
  { name: 'offline-cache-warning-font-synthesis', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontSynthesis.ts' },
  { name: 'offline-cache-warning-font-optical-sizing', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontOpticalSizing.ts' },
  { name: 'offline-cache-warning-text-rendering', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextRendering.ts' },
  { name: 'offline-cache-warning-font-feature-settings', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontFeatureSettings.ts' },
  { name: 'offline-cache-warning-font-variation-settings', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontVariationSettings.ts' },
  { name: 'offline-cache-warning-font-palette', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontPalette.ts' },
  { name: 'offline-cache-warning-font-size-adjust', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontSizeAdjust.ts' },
  { name: 'offline-cache-warning-font-stretch', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontStretch.ts' },
  { name: 'offline-cache-warning-font-style', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontStyle.ts' },
  { name: 'offline-cache-warning-font-weight', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontWeight.ts' },
  { name: 'offline-cache-warning-font-family', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontFamily.ts' },
  { name: 'offline-cache-warning-font-size', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningFontSize.ts' },
  { name: 'offline-cache-warning-line-height', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningLineHeight.ts' },
  { name: 'offline-cache-warning-letter-spacing', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningLetterSpacing.ts' },
  { name: 'offline-cache-warning-word-spacing', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningWordSpacing.ts' },
  { name: 'offline-cache-warning-text-indent', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextIndent.ts' },
  { name: 'offline-cache-warning-text-transform', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextTransform.ts' },
  { name: 'offline-cache-warning-text-decoration', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextDecoration.ts' },
  { name: 'offline-cache-warning-text-shadow', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextShadow.ts' },
  { name: 'offline-cache-warning-text-emphasis', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextEmphasis.ts' },
  { name: 'offline-cache-warning-text-orientation', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextOrientation.ts' },
  { name: 'offline-cache-warning-text-combine-upright', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextCombineUpright.ts' },
  { name: 'offline-cache-warning-text-underline-position', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextUnderlinePosition.ts' },
  { name: 'offline-cache-warning-text-underline-offset', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextUnderlineOffset.ts' },
  { name: 'offline-cache-warning-text-decoration-skip-ink', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextDecorationSkipInk.ts' },
  { name: 'offline-cache-warning-text-decoration-thickness', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextDecorationThickness.ts' },
  { name: 'offline-cache-warning-text-decoration-style', file: 'src/cli/validateGeneratedFrontendOfflineCacheWarningTextDecorationStyle.ts' },
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
