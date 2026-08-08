import React from 'react';
import { render } from '@testing-library/react';
import { RollProvider, type HistoryAdapter } from '@dicecaster/react';

const memoryAdapter: HistoryAdapter = {
  load: () => [],
  save: () => {},
};

export function renderWithProvider(ui: React.ReactElement) {
  return render(
    <RollProvider historyAdapter={memoryAdapter}>
      {ui}
    </RollProvider>
  );
}
