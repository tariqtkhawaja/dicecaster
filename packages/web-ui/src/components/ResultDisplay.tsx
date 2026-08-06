import { useRollResult } from '@dicecaster/react';

export function ResultDisplay() {
  const { lastResult, animation } = useRollResult();

  if (!lastResult) {
    return (
      <div className="text-gray-500 text-center py-8">
        Press Roll to start
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <span className="text-gray-400">Dice: </span>
        <span className="font-bold">
          {lastResult.dieValues.join(', ')}
        </span>
      </div>
      {lastResult.modifier !== 0 && (
        <div>
          <span className="text-gray-400">Modifier: </span>
          <span>{lastResult.modifier >= 0 ? '+' : ''}{lastResult.modifier}</span>
        </div>
      )}
      <div>
        <span className="text-gray-400">Total: </span>
        <span className="font-bold text-green-400 text-xl">{lastResult.total}</span>
      </div>
      {animation.phase === 'rolling' && (
        <div className="text-yellow-400 animate-pulse">Rolling...</div>
      )}
    </div>
  );
}
