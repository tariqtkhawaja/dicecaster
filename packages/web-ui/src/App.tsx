import { useEffect } from 'react';
import { RollProvider } from '@dicecaster/react';
import type { HistoryAdapter, HistoryEntry } from '@dicecaster/react';
import { DiceRoller } from './components/DiceRoller.js';
import { ResultDisplay } from './components/ResultDisplay.js';
import { RollHistory } from './components/RollHistory.js';

// Prefetch the 3D scene chunk on app mount so first roll isn't blocked by WASM download
function PrefetchDiceScene() {
  useEffect(() => {
    import('./components/DiceScene').then(m => {
      // Touch the export to ensure the chunk is cached
      void m.DiceScene;
    }).catch(() => { /* non-critical */ });
  }, []);
  return null;
}

const localStorageAdapter: HistoryAdapter = {
  load: () => {
    try { return JSON.parse(localStorage.getItem('dicecaster-history') || '[]'); } catch { return []; }
    },
  save: (entries) => localStorage.setItem('dicecaster-history', JSON.stringify(entries)),
};

export function App() {
  return (
    <>
      <PrefetchDiceScene />
      <RollProvider historyAdapter={localStorageAdapter}>
      <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 px-4 py-2 border-b border-gray-800">
          <h1 className="text-xl font-bold">Dicecaster</h1>
        </header>

        {/* Main area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: controls + canvas */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Controls — compact on desktop, always visible */}
            <div className="flex-shrink-0 p-3 border-b border-gray-800">
              <DiceRoller />
            </div>

            {/* Canvas — fills remaining space */}
            <div className="flex-1 min-h-0 p-3">
              <ResultDisplay className="h-full" />
            </div>
          </div>

          {/* Right: history sidebar — hidden on mobile, togglable */}
          <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0 border-l border-gray-800 overflow-hidden">
            <RollHistory className="h-full p-3" />
          </aside>
        </div>
      </div>
      </RollProvider>
    </>
  );
}
