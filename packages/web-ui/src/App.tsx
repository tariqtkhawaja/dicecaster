import { RollProvider } from '@dicecaster/react';
import type { HistoryAdapter, HistoryEntry } from '@dicecaster/react';
import { DiceRoller } from './components/DiceRoller.js';
import { ResultDisplay } from './components/ResultDisplay.js';
import { RollHistory } from './components/RollHistory.js';

const localStorageAdapter: HistoryAdapter = {
  load: () => {
    try { return JSON.parse(localStorage.getItem('dicecaster-history') || '[]'); } catch { return []; }
  },
  save: (entries) => localStorage.setItem('dicecaster-history', JSON.stringify(entries)),
};

export function App() {
  return (
    <RollProvider historyAdapter={localStorageAdapter}>
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Dicecaster</h1>
        <div className="flex gap-4">
          <div className="flex-1">
            <DiceRoller />
            <div className="mt-4">
              <ResultDisplay />
            </div>
          </div>
          <div className="w-80">
            <RollHistory />
          </div>
        </div>
      </div>
    </RollProvider>
  );
}
