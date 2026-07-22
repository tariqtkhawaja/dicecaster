export type DieType = "D4" | "D6" | "D8" | "D10" | "D12" | "D20" | "D100";

export interface DieConfig {
  amount: number;
  type: DieType;
}

