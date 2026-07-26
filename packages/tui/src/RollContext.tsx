import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { DIE_TYPES } from './components/DieButtons.js';

interface RollState {
  dieType: string;
  count: number;
  modifier: number;
  setDieType: (die: string) => void;
  setCount: (count: number) => void;
  setModifier: (mod: number) => void;
  expression: string;
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

  const setDieType = useCallback((d: string) => setRawDieType(d), []);
  const setCount = useCallback((c: number) => setRawCount(Math.max(1, Math.min(100, c))), []);
  const setModifier = useCallback((m: number) => setRawModifier(Math.max(-99, Math.min(99, m))), []);

  const expression = `${count}${dieType}${modifier >= 0 ? '+' : ''}${modifier}`;

  return (
    <RollContext.Provider value={{ dieType, count, modifier, setDieType, setCount, setModifier, expression }}>
      {children}
    </RollContext.Provider>
  );
}
