import { useState, useEffect, useRef, useCallback } from 'react';

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

interface UseDiceCascadeResult {
  displays: DieDisplay[];
  isAnimating: boolean;
  startCascade: (values: number[], sides: number) => void;
}

export function useDiceCascade(): UseDiceCascadeResult {
  const [finalValues, setFinalValues] = useState<number[]>([]);
  const [sides, setSides] = useState(6);
  const [startTime, setStartTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isAnimating) {
      stopAnimation();
      return;
    }

    const timer = setInterval(() => {
      frameRef.current += 1;
    }, FRAME_INTERVAL);
    timer.unref?.();
    intervalRef.current = timer;

    const totalFrames = (finalValues.length - 1) * Math.ceil(STAGGER_MS / FRAME_INTERVAL) + CASCADE_FRAMES + SETTLE_FLASH_FRAMES;
    const timeoutId = setTimeout(() => {
      stopAnimation();
      setIsAnimating(false);
    }, totalFrames * FRAME_INTERVAL + 100);
    timeoutId.unref?.();

    return () => {
      stopAnimation();
      clearTimeout(timeoutId);
    };
  }, [isAnimating, finalValues.length, stopAnimation]);

  const startCascade = useCallback((values: number[], dieSides: number) => {
    stopAnimation();
    setFinalValues(values);
    setSides(dieSides);
    setStartTime(Date.now());
    frameRef.current = 0;
    setIsAnimating(true);
  }, [stopAnimation]);

  const displays: DieDisplay[] = finalValues.map((finalValue, index) => {
    const staggerOffset = index * Math.ceil(STAGGER_MS / FRAME_INTERVAL);
    const localFrame = frameRef.current - staggerOffset;

    if (localFrame < 0) {
      return { value: 0, phase: 'idle' };
    }

    if (localFrame >= CASCADE_FRAMES + SETTLE_FLASH_FRAMES) {
      const isMax = finalValue === sides;
      return {
        value: finalValue,
        phase: 'settled',
        color: isMax ? 'yellow' : undefined,
        bold: isMax,
      };
    }

    if (localFrame >= CASCADE_FRAMES) {
      return {
        value: finalValue,
        phase: 'flashing',
        inverse: true,
        bold: true,
      };
    }

    const intermediate = ((localFrame * 7 + index * 3 + finalValue) % sides) + 1;
    const color = CASCADE_COLORS[localFrame % CASCADE_COLORS.length];
    return {
      value: intermediate,
      phase: 'cascading',
      color,
    };
  });

  return { displays, isAnimating, startCascade };
}
