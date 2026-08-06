import React, { useMemo, useEffect } from 'react';
import { useRollResult } from '@dicecaster/react';

const FRAME_INTERVAL = 60;
const CASCADE_FRAMES = 12;
const STAGGER_MS = 150;
const SETTLE_FLASH_FRAMES = 1;

const CASCADE_COLORS: string[] = ['yellow', 'cyan', 'magenta', 'red'];

export type DiePhase = 'idle' | 'cascading' | 'flashing' | 'settled';

export interface DieDisplay {
  value: number;
  phase: DiePhase;
  color?: string;
  inverse?: boolean;
  bold?: boolean;
}

interface UseTuiAnimationResult {
  displays: DieDisplay[];
  isAnimating: boolean;
}

export function useTuiAnimation(): UseTuiAnimationResult {
  const { animation } = useRollResult();

  const result = useMemo(() => {
    if (animation.phase === 'idle' || !animation.startedAt) {
      return {
        displays: [],
        isAnimating: false,
      };
    }

    const elapsed = Date.now() - animation.startedAt;
    const currentFrame = Math.floor(elapsed / FRAME_INTERVAL);
    const sides = animation.sides || 6;
    const dieValues = animation.dieValues;

    const totalFrames = (dieValues.length - 1) * Math.ceil(STAGGER_MS / FRAME_INTERVAL) + CASCADE_FRAMES + SETTLE_FLASH_FRAMES;
    const isAnimating = currentFrame < totalFrames;

    const displays: DieDisplay[] = dieValues.map((finalValue, index) => {
      const staggerOffset = index * Math.ceil(STAGGER_MS / FRAME_INTERVAL);
      const localFrame = currentFrame - staggerOffset;

      if (localFrame < 0) {
        return { value: 0, phase: 'idle' as const };
      }

      if (localFrame >= CASCADE_FRAMES + SETTLE_FLASH_FRAMES) {
        const isMax = finalValue === sides;
        return {
          value: finalValue,
          phase: 'settled' as const,
          color: isMax ? 'yellow' : undefined,
          bold: isMax,
        };
      }

      if (localFrame >= CASCADE_FRAMES) {
        return {
          value: finalValue,
          phase: 'flashing' as const,
          inverse: true,
          bold: true,
        };
      }

      const intermediate = ((localFrame * 7 + index * 3 + finalValue) % sides) + 1;
      const color = CASCADE_COLORS[localFrame % CASCADE_COLORS.length];
      return {
        value: intermediate,
        phase: 'cascading' as const,
        color,
      };
    });

    return { displays, isAnimating };
  }, [animation]);

  // Force re-render during animation
  const [, setTick] = React.useState(0);
  useEffect(() => {
    if (!result.isAnimating) return;
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, FRAME_INTERVAL);
    timer.unref?.();
    return () => clearInterval(timer);
  }, [result.isAnimating]);

  return result;
}
