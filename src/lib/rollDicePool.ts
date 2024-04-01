import type { DieConfig, DieType } from '../dice-roller';
import { rollDice } from './rollDice';


export interface DiceResult {
    results: number[];
    type: DieType;
}
/**
 * Rolls a pool of dice.
 * @params DieConfig[] an array of DieConfig objects.
 * @returns an array of DiceResult objects.
 * @example rollDicePool([{ type: 'D6', amount: 2 }, { type: 'D8', amount: 1 }])  // [{ results: [3, 6], type: 'D6' }, { results: [8], type: 'D8' }]
 * 
 */
export const rollDicePool = (dice: DieConfig[] = []): DiceResult[] => {
    return dice.map(({ amount, type }) => ({
        results: rollDice(type, amount),
        type
    }))
}