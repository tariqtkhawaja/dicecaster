import { useRollHistory } from '@dicecaster/react';

export function RollHistory() {
  const history = useRollHistory();

  if (history.entries.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="font-bold text-gray-400 mb-2">History</h2>
        <p className="text-gray-500">No rolls yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 max-h-[600px] overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-gray-400">History</h2>
        <button
          onClick={history.clear}
          className="text-sm text-red-400 hover:text-red-300"
        >
          Clear
        </button>
      </div>
      <div className="space-y-2">
        {history.entries.map((entry) => (
          <div key={entry.id} className="border-b border-gray-700 pb-2">
            <div className="flex justify-between">
              <span className="text-gray-400">{entry.expression}</span>
              <span className="font-bold text-green-400">= {entry.total}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {entry.dice.map((group, i) => (
                <span key={i}>
                  {group.count}d{group.sides}=[{group.results.join(',')}]
                  {i < entry.dice.length - 1 ? ' ' : ''}
                </span>
              ))}
              {entry.modifier !== 0 && (
                <span> {entry.modifier >= 0 ? '+' : ''}{entry.modifier}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
