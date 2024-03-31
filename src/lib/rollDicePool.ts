import type { DieConfig, DieType } from '../dice-roller';
import { rollDice } from './rollDice';


export interface DiceResult {
    results: number[];
    type: DieType;
}
export const rollDicePool = (dice: DieConfig[] = []): DiceResult[] => {
    return dice.map(({ amount, type }) => ({
        results: rollDice(type, amount),
        type
    }))
}