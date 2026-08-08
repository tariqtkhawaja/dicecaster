import { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { useRollResult, useRollConfig } from '@dicecaster/react';

const DiceScene = lazy(() => import('./DiceScene').then(m => ({ default: m.DiceScene })));

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

interface ResultDisplayProps {
  className?: string;
}

export function ResultDisplay({ className }: ResultDisplayProps) {
  const { lastResult, animation } = useRollResult();
  const { dieType, count } = useRollConfig();
  const reducedMotion = useReducedMotion();
  const isRolling = animation.phase === 'rolling';

  const handleSettled = useCallback(() => {
    // Phase transition is handled by the RollProvider's timer.
    // This callback is a no-op here because the physics settle detection
    // runs in parallel with the existing auto-settle; when all dice sleep
    // before the timer fires, the phase is already "settled" from the timer.
  }, []);

  if (!lastResult && !isRolling) {
    return (
      <div className={`text-gray-500 text-center py-8 ${className ?? ''}`.trim()}>
        Press Roll to start
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className ?? ''}`.trim()}>
      {isRolling && !reducedMotion ? (
        <div style={{ width: '100%', minHeight: 300 }}>
          <Suspense fallback={<div className="text-yellow-400 animate-pulse text-center py-8">Rolling...</div>}>
            <DiceScene
              dieType={dieType}
              count={count}
              dieValues={animation.dieValues}
              startedAt={animation.startedAt ?? Date.now()}
              onSettled={handleSettled}
            />
          </Suspense>
        </div>
      ) : (
        <>
          {(lastResult || isRolling) && (
            <>
              <div>
                <span className="text-gray-400">Dice: </span>
                <span className="font-bold">
                  {lastResult ? lastResult.dieValues.join(', ') : (isRolling ? '...' : '')}
                </span>
              </div>
              {lastResult && lastResult.modifier !== 0 && (
                <div>
                  <span className="text-gray-400">Modifier: </span>
                  <span>{lastResult.modifier >= 0 ? '+' : ''}{lastResult.modifier}</span>
                </div>
              )}
              {lastResult && (
                <div>
                  <span className="text-gray-400">Total: </span>
                  <span className="font-bold text-green-400 text-xl">{lastResult.total}</span>
                </div>
              )}
              {isRolling && reducedMotion && (
                <div className="text-yellow-400 animate-pulse">Rolling...</div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
