import React, { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { rollDice, getNumberOfSides } from '@dicecaster/core';
import type {
  DieType,
  RollConfig,
  RollResult,
  HistoryEntry,
  HistoryAdapter,
  AnimationPhase,
  AnimationState,
} from './types';
import { DIE_TYPES } from './types';

const defaultAnimation: AnimationState = {
  phase: "idle",
  dieValues: [],
  sides: 0,
  startedAt: null,
};

// ─── Context types ────────────────────────────────────────────────

interface RollConfigContextValue {
  dieType: DieType;
  count: number;
  modifier: number;
  setDieType: (d: DieType) => void;
  setCount: (c: number) => void;
  setModifier: (m: number) => void;
  expression: string;
  DIE_TYPES: readonly DieType[];
}

interface RollResultContextValue {
  lastResult: RollResult | null;
  animation: AnimationState;
  executeRoll: () => void;
}

interface RollHistoryContextValue {
  entries: HistoryEntry[];
  maxEntries: number;
  clear: () => void;
}

// ─── Contexts ─────────────────────────────────────────────────────

const RollConfigContext = createContext<RollConfigContextValue>(null!);
const RollResultContext = createContext<RollResultContextValue>(null!);
const RollHistoryContext = createContext<RollHistoryContextValue>(null!);

// ─── Provider ─────────────────────────────────────────────────────

interface RollProviderProps {
  children: ReactNode;
  historyAdapter?: HistoryAdapter;
  defaultConfig?: Partial<RollConfig>;
  maxHistory?: number;
}

export function RollProvider({
  children,
  historyAdapter,
  defaultConfig = {},
  maxHistory = 100,
}: RollProviderProps) {
  const initialDieType: DieType = (defaultConfig.dieType ?? "D4") as DieType;
  const initialCount = Math.max(1, Math.min(100, defaultConfig.count ?? 1));
  const initialModifier = Math.max(-99, Math.min(99, defaultConfig.modifier ?? 0));

  // Config state
  const [dieType, setRawDieType] = useState<DieType>(initialDieType);
  const [count, setRawCount] = useState(initialCount);
  const [modifier, setRawModifier] = useState(initialModifier);

  const setDieType = useCallback((d: DieType) => setRawDieType(d), []);
  const setCount = useCallback((c: number) => setRawCount(Math.max(1, Math.min(100, c))), []);
  const setModifier = useCallback((m: number) => setRawModifier(Math.max(-99, Math.min(99, m))), []);

  const expression = `${count}${dieType}${modifier >= 0 ? '+' : ''}${modifier}`;

  // Result + animation state
  const [lastResult, setLastResult] = useState<RollResult | null>(null);
  const [animation, setAnimation] = useState<AnimationState>(defaultAnimation);

  // Track active settle timer so a new roll cancels the previous one
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // History state
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(() => {
    if (historyAdapter) {
      try { return historyAdapter.load(); } catch { return []; }
    }
    return [];
  });

  const persistHistory = useCallback(
    (entries: HistoryEntry[]) => {
      if (historyAdapter) {
        try { historyAdapter.save(entries); } catch { /* silent */ }
      }
    },
    [historyAdapter],
  );

  const executeRoll = useCallback(() => {
    // Cancel any pending settle timer from a previous roll
    if (settleTimerRef.current !== null) {
      clearTimeout(settleTimerRef.current);
    }

    const sides = getNumberOfSides(dieType);
    const dieValues = rollDice(dieType, count);
    const total = dieValues.reduce((sum, v) => sum + v, 0) + modifier;

    const result: RollResult = {
      expression,
      dieValues,
      sides,
      modifier,
      total,
    };

    setLastResult(result);

    // Start rolling animation
    const startedAt = Date.now();
    setAnimation({
      phase: "rolling",
      dieValues,
      sides,
      startedAt,
    });

    // Auto-settle after delay (2000ms base + 150ms per die beyond first)
    const settleDelay = 2000 + (count - 1) * 150;
    settleTimerRef.current = setTimeout(() => {
      setAnimation(prev => prev.startedAt === startedAt
        ? { ...prev, phase: "settled" }
        : prev
      );
      settleTimerRef.current = null;
    }, settleDelay);

    // Append to history
    const entry: HistoryEntry = {
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      expression,
      dice: [{ count, sides, results: dieValues }],
      modifier,
      total,
    };

    setHistoryEntries(prev => {
      const updated = [entry, ...prev];
      while (updated.length > maxHistory) {
        updated.pop();
      }
      persistHistory(updated);
      return updated;
    });
  }, [dieType, count, modifier, expression, maxHistory, persistHistory]);

  const clearHistory = useCallback(() => {
    setHistoryEntries([]);
    persistHistory([]);
  }, [persistHistory]);

  return (
    <RollConfigContext.Provider value={{ dieType, count, modifier, setDieType, setCount, setModifier, expression, DIE_TYPES }}>
      <RollResultContext.Provider value={{ lastResult, animation, executeRoll }}>
        <RollHistoryContext.Provider value={{ entries: historyEntries, maxEntries: maxHistory, clear: clearHistory }}>
          {children}
        </RollHistoryContext.Provider>
      </RollResultContext.Provider>
    </RollConfigContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────

export function useRollConfig(): RollConfigContextValue {
  const ctx = useContext(RollConfigContext);
  if (!ctx) {
    throw new Error("useRollConfig must be used within a RollProvider");
  }
  return ctx;
}

export function useRollResult(): RollResultContextValue {
  const ctx = useContext(RollResultContext);
  if (!ctx) {
    throw new Error("useRollResult must be used within a RollProvider");
  }
  return ctx;
}

export function useRollHistory(): RollHistoryContextValue {
  const ctx = useContext(RollHistoryContext);
  if (!ctx) {
    throw new Error("useRollHistory must be used within a RollProvider");
  }
  return ctx;
}
