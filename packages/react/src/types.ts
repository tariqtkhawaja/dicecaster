import type { DieType as CoreDieType } from '@dicecaster/core';

export type DieType = CoreDieType;

export const DIE_TYPES: readonly DieType[] = ["D4", "D6", "D8", "D10", "D12", "D20", "D100"];

export interface RollConfig {
  dieType: DieType;
  count: number;
  modifier: number;
}

export interface RollResult {
  expression: string;
  dieValues: number[];
  sides: number;
  modifier: number;
  total: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  expression: string;
  dice: { count: number; sides: number; results: number[] }[];
  modifier: number;
  total: number;
}

export interface HistoryAdapter {
  load(): HistoryEntry[];
  save(entries: HistoryEntry[]): void;
}

export type AnimationPhase = "idle" | "rolling" | "settled";

export interface AnimationState {
  phase: AnimationPhase;
  dieValues: number[];
  sides: number;
  startedAt: number | null;
}
