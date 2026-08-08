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
  const { lastResult, animation, requestSettle, registerSceneReady, unregisterSceneReady } = useRollResult();
  const { dieType, count } = useRollConfig();
  const reducedMotion = useReducedMotion();
  const isRolling = animation.phase === 'rolling';

  const handleSettled = useCallback(() => {
    requestSettle();
  }, [requestSettle]);

  if (!lastResult && !isRolling) {
    return (
      <div className={`flex items-center justify-center text-gray-500 text-center ${className ?? ''}`.trim()}>
        Press Roll to start
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className ?? ''}`.trim()}>
      {isRolling && !reducedMotion ? (
        /* 3D canvas — fills available height */
        <div className="flex-1 min-h-0">
          <Suspense fallback={<div className="h-full flex items-center justify-center text-yellow-400 animate-pulse">Rolling...</div>}>
            <DiceScene
              dieType={dieType}
              count={count}
              dieValues={animation.dieValues}
              startedAt={animation.startedAt ?? Date.now()}
              onSettled={handleSettled}
              onReady={registerSceneReady}
              onUnmount={unregisterSceneReady}
            />
          </Suspense>
        </div>
      ) : (
        /* Settled results — centered in available space */
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          {(lastResult || isRolling) && (
            <>
              <div className="text-lg">
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
                  <span className="font-bold text-green-400 text-2xl">{lastResult.total}</span>
                </div>
              )}
              {isRolling && reducedMotion && (
                <div className="text-yellow-400 animate-pulse">Rolling...</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
