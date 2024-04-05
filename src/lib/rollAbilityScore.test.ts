import { rollAbilityScore } from './rollAbilityScore';
import type { AbilityCheckConfig, CheckResult } from './rollAbilityScore'

describe('rollAbilityScore', () => {
    it('should return a number within the expected range', () => {
        const roll = rollAbilityScore({ abilityScoreModifier: 0, modifiers: [] });
        expect(roll.result).toBeGreaterThanOrEqual(1);
        expect(roll.result).toBeLessThanOrEqual(20);
    });

    it('should return a number within the expected range when a ability score modifier is provided', () => {
        const roll = rollAbilityScore({ abilityScoreModifier: 4, modifiers: [] });
        expect(roll.result).toBeGreaterThanOrEqual(4);
        expect(roll.result).toBeLessThanOrEqual(24);
    });

    it('should return a number within the expected range when a modifier is provided', () => {
        const roll = rollAbilityScore({ abilityScoreModifier: 0, modifiers: [1] });
        expect(roll.result).toBeGreaterThanOrEqual(2);
        expect(roll.result).toBeLessThanOrEqual(21);
    });

    it('should return a number within the expected range when multiple modifiers are provided', () => {
        const roll = rollAbilityScore({ abilityScoreModifier: 0, modifiers: [1, 2, 3] });
        expect(roll.result).toBeGreaterThanOrEqual(7);
        expect(roll.result).toBeLessThanOrEqual(26);
    });
});

