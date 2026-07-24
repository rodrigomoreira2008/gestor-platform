export interface FrontendDelphiRuntimeGeneratorOptions {
  entityPascal: string;
  entity: string;
}

export function renderFrontendDelphiRuntime(options: FrontendDelphiRuntimeGeneratorOptions): string {
  const { entityPascal, entity } = options;
  return `import { useMemo } from 'react';
import { useCreate${entityPascal}, useRemove${entityPascal}, useUpdate${entityPascal} } from '../hooks';
import type { ${entityPascal}Input } from '../types/${entity}';
import type { DelphiActionRuntime } from './${entity}DelphiActions';

export interface Use${entityPascal}DelphiRuntimeOptions {
  id?: number;
  onClose?: () => void;
  onNotify?: (message: string) => void;
  onOpenDataset?: (dataset: string) => Promise<unknown> | unknown;
  onInvoke?: (target: string, expression?: string) => Promise<unknown> | unknown;
}

export function use${entityPascal}DelphiRuntime(options: Use${entityPascal}DelphiRuntimeOptions = {}): DelphiActionRuntime {
  const create = useCreate${entityPascal}();
  const update = useUpdate${entityPascal}();
  const remove = useRemove${entityPascal}();

  return useMemo(() => ({
    save: async (input: ${entityPascal}Input) => {
      if (options.id === undefined) {
        await create.mutateAsync(input);
        return;
      }
      await update.mutateAsync({ id: options.id, input });
    },
    remove: async (id: number) => {
      await remove.mutateAsync(id);
    },
    openDataset: options.onOpenDataset,
    close: options.onClose,
    notify: options.onNotify,
    invoke: options.onInvoke
  }), [create, remove, update, options.id, options.onClose, options.onInvoke, options.onNotify, options.onOpenDataset]);
}
`;
}
