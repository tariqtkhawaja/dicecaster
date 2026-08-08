import { jest } from '@jest/globals';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { RollProvider, type HistoryAdapter } from '@dicecaster/react';
import { ResultDisplay } from '../components/ResultDisplay.js';
import { DiceRoller } from '../components/DiceRoller.js';

const memoryAdapter: HistoryAdapter = {
  load: () => [],
  save: () => {},
};

function renderWithRoll() {
  return (
    <RollProvider historyAdapter={memoryAdapter}>
      <DiceRoller />
      <ResultDisplay />
    </RollProvider>
  );
}

describe('ResultDisplay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows placeholder before first roll', () => {
    render(renderWithRoll());
    expect(screen.getByText('Press Roll to start')).toBeInTheDocument();
  });

  it('displays die values during rolling phase', () => {
    render(renderWithRoll());
    const rollBtn = screen.getByRole('button', { name: /roll/i });
    fireEvent.click(rollBtn);
    expect(screen.getByText('Rolling...')).toBeInTheDocument();
  });

  it('shows settled total after animation completes', () => {
    render(renderWithRoll());
    const rollBtn = screen.getByRole('button', { name: /roll/i });
    fireEvent.click(rollBtn);
    jest.advanceTimersByTime(3000);
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
  });

  it('shows modifier breakdown when modifier is nonzero', () => {
    render(
      <RollProvider historyAdapter={memoryAdapter} defaultConfig={{ modifier: 5 }}>
        <DiceRoller />
        <ResultDisplay />
      </RollProvider>
    );
    const rollBtn = screen.getByRole('button', { name: /roll/i });
    fireEvent.click(rollBtn);
    jest.advanceTimersByTime(3000);
    expect(screen.getByText(/Modifier:/)).toBeInTheDocument();
  });
});
