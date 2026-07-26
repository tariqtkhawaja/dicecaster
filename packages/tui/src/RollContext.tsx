import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { rollDice } from '@dicecaster/core';
import { DIE_TYPES } from './components/DieButtons.js';

export interface RollResult {
  expression: string;
  dieValues: number[];
  modifier: number;
  total: number;
}

interface RollState {
  dieType: string;
  count: number;
  modifier: number;
  setDieType: (die: string) => void;
  setCount: (count: number) => void;
  setModifier: (mod: number) => void;
  expression: string;
  lastResult: RollResult | null;
  executeRoll: () => void;
}

const RollContext = createContext<RollState>(null!);

export function useRoll(): RollState {
  return useContext(RollContext);
}

interface RollProviderProps {
  children: ReactNode;
}

export function RollProvider({ children }: RollProviderProps) {
  const [dieType, setRawDieType] = useState<string>(DIE_TYPES[0]);
  const [count, setRawCount] = useState(1);
  const [modifier, setRawModifier] = useState(0);
  const [lastResult, setLastResult] = useState<RollResult | null>(null);

  const setDieType = useCallback((d: string) => setRawDieType(d), []);
  const setCount = useCallback((c: number) => setRawCount(Math.max(1, Math.min(100, c))), []);
  const setModifier = useCallback((m: number) => setRawModifier(Math.max(-99, Math.min(99, m))), []);

  const expression = `${count}${dieType}${modifier >= 0 ? '+' : ''}${modifier}`;

  const executeRoll = useCallback(() => {
    const dieValues = rollDice(dieType as Parameters<typeof rollDice>[0], count);
    const total = dieValues.reduce((sum, v) => sum + v, 0) + modifier;
    setLastResult({
      expression,
      dieValues,
      modifier,
      total,
    });
  }, [dieType, count, modifier, expression]);

  return (
    <RollContext.Provider value={{ dieType, count, modifier, setDieType, setCount, setModifier, expression, lastResult, executeRoll }}>
      {children}
    </RollContext.Provider>
  );
}
