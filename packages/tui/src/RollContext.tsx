import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { rollDice } from '@dicecaster/core';
import { DIE_TYPES } from './components/DieButtons.js';
import { loadHistory, appendEntry, type HistoryEntry } from './history.js';

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
  history: HistoryEntry[];
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
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory().entries);

  const setDieType = useCallback((d: string) => setRawDieType(d), []);
  const setCount = useCallback((c: number) => setRawCount(Math.max(1, Math.min(100, c))), []);
  const setModifier = useCallback((m: number) => setRawModifier(Math.max(-99, Math.min(99, m))), []);

  const expression = `${count}${dieType}${modifier >= 0 ? '+' : ''}${modifier}`;

  const executeRoll = useCallback(() => {
    const dieValues = rollDice(dieType as Parameters<typeof rollDice>[0], count);
    const total = dieValues.reduce((sum, v) => sum + v, 0) + modifier;
    const result: RollResult = {
      expression,
      dieValues,
      modifier,
      total,
    };
    setLastResult(result);
    const updated = appendEntry({
      expression,
      dice: [{ count, sides: parseInt(dieType.replace('D', ''), 10), results: dieValues }],
      modifier,
      total,
    });
    setHistory(updated.entries);
  }, [dieType, count, modifier, expression]);

  return (
    <RollContext.Provider value={{ dieType, count, modifier, setDieType, setCount, setModifier, expression, lastResult, executeRoll, history }}>
      {children}
    </RollContext.Provider>
  );
}
