import { getNumberOfSides, calculateRollResult, rollDie } from './rollDie';
import type { DieType } from '../dice-roller.ts';
import { describe, it, expect } from '@jest/globals';


describe('getNumberOfSides', () => {
    it('should return the correct number of sides for each die type', () => {
        const dieTypes: DieType[] = ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100'];
        const expectedSides = [4, 6, 8, 10, 12, 20, 100];

        dieTypes.forEach((type, index) => {
            expect(getNumberOfSides(type)).toBe(expectedSides[index]);
        });
    });
});

describe('calculateRollResult', () => {
    it('should return a number within the expected range', () => {
        const numberOfSides = 6;
        const result = calculateRollResult(numberOfSides);

        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(numberOfSides);
    });
});

describe('rollDie', () => {
    it('should return a number within the expected range for each die type', () => {
        const dieTypes: DieType[] = ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100'];

        dieTypes.forEach(type => {
            const result = rollDie(type);
            const numberOfSides = getNumberOfSides(type);

            expect(result).toBeGreaterThanOrEqual(1);
            expect(result).toBeLessThanOrEqual(numberOfSides);
        });
    });
});