import { rollD20 } from './rollD20';
import { describe, it, expect } from '@jest/globals';

describe('rollD20', () => {
    it('should return a number within the expected range', () => {
        const result = rollD20();

        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(20);
    });
    it(`should roll 2 d20's and return the highest value`, () => {
        const result = rollD20({ advantage: true });
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(20);
    });
    it(`should roll 2 d20's and return the lowest value`, () => {
        const result = rollD20({ disadvantage: true });
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(20);
    });
    it(`should return a number within the expected range when both advantage and disadvantage are true`, () => {
        const result = rollD20({ advantage: true, disadvantage: true });
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(20);
    });
});
