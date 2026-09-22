import { useSyncExternalStore } from 'react';

import { financeRepository, type FinanceRepository } from './financeRepository';

export function useFinanceData(repository: FinanceRepository = financeRepository) {
  return useSyncExternalStore(
    repository.subscribe,
    repository.getSnapshot,
    repository.getSnapshot,
  );
}
