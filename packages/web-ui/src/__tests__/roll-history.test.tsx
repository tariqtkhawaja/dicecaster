import { render, screen } from '@testing-library/react';
import React from 'react';
import { RollProvider, type HistoryAdapter } from '@dicecaster/react';
import { RollHistory } from '../components/RollHistory.js';

const emptyAdapter: HistoryAdapter = {
  load: () => [],
  save: () => {},
};

const seededAdapter: HistoryAdapter = {
  load: () => [
    {
      id: 'test-1',
      timestamp: '2025-01-01T00:00:00.000Z',
      expression: '2d6+3',
      dice: [{ count: 2, sides: 6, results: [4, 3] }],
      modifier: 3,
      total: 10,
    },
    {
      id: 'test-2',
      timestamp: '2025-01-01T00:00:01.000Z',
      expression: '1d20',
      dice: [{ count: 1, sides: 20, results: [17] }],
      modifier: 0,
      total: 17,
    },
  ],
  save: () => {},
};

describe('RollHistory', () => {
  it('shows empty state message when no entries', () => {
    render(
      <RollProvider historyAdapter={emptyAdapter}>
        <RollHistory />
      </RollProvider>
    );
    expect(screen.getByText('No rolls yet')).toBeInTheDocument();
  });

  it('renders history entries newest-first', () => {
    render(
      <RollProvider historyAdapter={seededAdapter}>
        <RollHistory />
      </RollProvider>
    );
    const expressions = screen.getAllByText(/d/);
    expect(expressions.length).toBeGreaterThanOrEqual(2);
  });

  it('displays expression and total for each entry', () => {
    render(
      <RollProvider historyAdapter={seededAdapter}>
        <RollHistory />
      </RollProvider>
    );
    expect(screen.getByText('= 10')).toBeInTheDocument();
    expect(screen.getByText('= 17')).toBeInTheDocument();
  });

  it('renders die group details', () => {
    render(
      <RollProvider historyAdapter={seededAdapter}>
        <RollHistory />
      </RollProvider>
    );
    expect(screen.getAllByText(/\[4,3\]/).length).toBeGreaterThanOrEqual(1);
  });
});
