import { DieType } from '@dicecaster/react';

export interface DieConfig {
  sides: number;
  scale: number;
  colors: { bg: string; text: string };
}

export const DIE_CONFIGS: Record<DieType, DieConfig> = {
  D4:   { sides: 4,  scale: 0.5,  colors: { bg: '#ef4444', text: '#ffffff' } },
  D6:   { sides: 6,  scale: 0.6,  colors: { bg: '#3b82f6', text: '#ffffff' } },
  D8:   { sides: 8,  scale: 0.55, colors: { bg: '#22c55e', text: '#ffffff' } },
  D10:  { sides: 10, scale: 0.5,  colors: { bg: '#a855f7', text: '#ffffff' } },
  D12:  { sides: 12, scale: 0.6,  colors: { bg: '#f97316', text: '#ffffff' } },
  D20:  { sides: 20, scale: 0.65, colors: { bg: '#eab308', text: '#000000' } },
  D100: { sides: 100,scale: 0.5,  colors: { bg: '#6b7280', text: '#ffffff' } },
};

export function getSides(dt: DieType): number {
  return DIE_CONFIGS[dt].sides;
}

export function getDieScale(dt: DieType): number {
  return DIE_CONFIGS[dt].scale;
}
