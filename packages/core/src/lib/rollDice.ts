import type { DieType } from '../dice-roller.ts';
import { rollDie } from "./rollDie";
/**
 * 
 * @param type DieType
 * @param amount The amount of dice to be rolled.
 * @returns an array of randomised results of a specificed die type.
 */

export const rollDice = (type: DieType, amount: number): number[] => {
    return Array.from({ length: amount }, () => rollDie(type));
}