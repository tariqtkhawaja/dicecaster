import { useRollConfig, useRollResult } from '@dicecaster/react';

interface DiceRollerProps {
  className?: string;
}

export function DiceRoller({ className }: DiceRollerProps) {
  const config = useRollConfig();
  const result = useRollResult();

  return (
    <div className={`space-y-2 ${className ?? ''}`.trim()}>
      {/* Die type buttons */}
      <div className="flex flex-wrap gap-1.5">
        {config.DIE_TYPES.map((die) => (
          <button
            key={die}
            onClick={() => config.setDieType(die)}
            className={`px-2.5 py-1 text-sm rounded font-bold transition-colors ${
              config.dieType === die
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {die}
          </button>
        ))}
      </div>

      {/* Count, modifier, expression, roll — single row on desktop, wraps on mobile */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1 rounded">
          <span className="text-xs text-gray-400">Count</span>
          <button
            onClick={() => config.setCount(config.count - 1)}
            className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded hover:bg-gray-600 text-sm"
          >
            -
          </button>
          <span className="font-bold w-6 text-center">{config.count}</span>
          <button
            onClick={() => config.setCount(config.count + 1)}
            className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded hover:bg-gray-600 text-sm"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1 rounded">
          <span className="text-xs text-gray-400">Mod</span>
          <button
            onClick={() => config.setModifier(config.modifier - 1)}
            className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded hover:bg-gray-600 text-sm"
          >
            -
          </button>
          <span className="font-bold w-10 text-center">
            {config.modifier >= 0 ? '+' : ''}{config.modifier}
          </span>
          <button
            onClick={() => config.setModifier(config.modifier + 1)}
            className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded hover:bg-gray-600 text-sm"
          >
            +
          </button>
        </div>

        <span className="text-lg font-bold text-cyan-400 ml-auto">{config.expression}</span>

        <button
          onClick={result.executeRoll}
          disabled={result.animation.phase === 'rolling'}
          className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded font-bold text-base transition-colors whitespace-nowrap"
        >
          Roll
        </button>
      </div>
    </div>
  );
}
