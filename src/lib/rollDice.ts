import type { DieType } from '../dice-roller.ts';
import { rollDie } from "./rollDie";


export const rollDice = (type: DieType, amount: number): number[] => {
    return Array.from({ length: amount }, () => rollDie(type));
}