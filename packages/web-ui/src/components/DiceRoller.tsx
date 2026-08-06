import { useRollConfig, useRollResult } from '@dicecaster/react';

interface DiceRollerProps {
  className?: string;
}

export function DiceRoller({ className }: DiceRollerProps) {
  const config = useRollConfig();
  const result = useRollResult();

  return (
    <div className={`space-y-4 ${className ?? ''}`.trim()}>
      <div className="flex flex-wrap gap-2">
        {config.DIE_TYPES.map((die) => (
          <button
            key={die}
            onClick={() => config.setDieType(die)}
            className={`px-3 py-2 rounded font-bold ${
              config.dieType === die
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {die}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded">
          <span className="text-gray-400">Count:</span>
          <button
            onClick={() => config.setCount(config.count - 1)}
            className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            -
          </button>
          <span className="font-bold w-8 text-center">{config.count}</span>
          <button
            onClick={() => config.setCount(config.count + 1)}
            className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded">
          <span className="text-gray-400">Mod:</span>
          <button
            onClick={() => config.setModifier(config.modifier - 1)}
            className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            -
          </button>
          <span className="font-bold w-12 text-center">
            {config.modifier >= 0 ? '+' : ''}{config.modifier}
          </span>
          <button
            onClick={() => config.setModifier(config.modifier + 1)}
            className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            +
          </button>
        </div>
      </div>

      <div className="text-xl font-bold text-cyan-400">{config.expression}</div>

      <button
        onClick={result.executeRoll}
        disabled={result.animation.phase === 'rolling'}
        className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded font-bold text-lg transition-colors"
      >
        Roll
      </button>
    </div>
  );
}
