import { rollDicePool } from './rollDicePool';
import { getNumberOfSides } from './rollDie';
import { describe, it, expect } from '@jest/globals';
import type { DieType } from '../dice-roller';


describe('rollDicePool', () => {
    const dieTypes: DieType[] = ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100'];
    const amounts = [1, 2, 3, 4, 5];

    dieTypes.forEach(type => {
        amounts.forEach(amount => {
            it(`should return an array of length 1 with numbers within the expected range for ${amount} ${type}`, () => {
                const result = rollDicePool([{ amount, type }]);
                const numberOfSides = getNumberOfSides(type);

                expect(result.length).toBe(1); // The length should be 1 because we are rolling one type of die
                result.forEach(({ results }) => {
                    expect(results.length).toBe(amount); // The length of results should be equal to the amount of dice rolled
                    results.forEach(num => {
                        expect(num).toBeGreaterThanOrEqual(1);
                        expect(num).toBeLessThanOrEqual(numberOfSides);
                    });
                });
            });
            it(`should return an array of objects with the correct amount of results for ${amount} ${type}`, () => {
                const result = rollDicePool([{ amount, type }]);
                const numberOfSides = getNumberOfSides(type);

                expect(result.length).toBe(1); // The length should be 1 because we are rolling one type of die
                result.forEach(({ results }) => {
                    expect(results.length).toBe(amount); // The length of results should be equal to the amount of dice rolled on each object
                    results.forEach(num => {
                        expect(num).toBeGreaterThanOrEqual(1);
                        expect(num).toBeLessThanOrEqual(numberOfSides);
                    });
                });
            });
        });
    });
});