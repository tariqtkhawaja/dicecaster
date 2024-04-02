import type { DieType } from '../dice-roller.ts';
import { describe, it, expect } from '@jest/globals';
import { getNumberOfSides } from './rollDie';
import { rollDice } from './rollDice';

describe('rollDice', () => {
    const dieTypes: DieType[] = ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100'];
    const amount = 5;

    dieTypes.forEach(type => {
        it(`should return an array of length ${amount} with numbers within the expected range for ${type}`, () => {
            const result = rollDice(type, amount);
            const numberOfSides = getNumberOfSides(type);

            expect(result.length).toBe(amount);
            result.forEach(num => {
                expect(num).toBeGreaterThanOrEqual(1);
                expect(num).toBeLessThanOrEqual(numberOfSides);
            });
        });
    });
});