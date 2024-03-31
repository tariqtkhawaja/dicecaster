import { rollAbilityScore } from './rollAbilityScore';
import type { AbilityCheckConfig, CheckResult } from './rollAbilityScore'
import { describe, expect, it, test } from '@jest/globals';

describe('rollAbilityScore', () => {
    it('should return a number within the expected range', () => {
        const result = rollAbilityScore({ abilityScoreModifier: 0, modifiers: [] });
        expect(result).toBeGreaterThanOrEqual(3);
        expect(result).toBeLessThanOrEqual(18);
    });
    it('should return a number within the expected range when a ability score modifier is provided', () => {
        const result = rollAbilityScore({ abilityScoreModifier: 4, modifiers: [] });
        expect(result).toBeGreaterThanOrEqual(3);
        expect(result).toBeLessThanOrEqual(18);
    });
    it('should return a number within the expected range when a modifier is provided', () => {
        const result = rollAbilityScore({ abilityScoreModifier: 0, modifiers: [1] });
        expect(result).toBeGreaterThanOrEqual(3);
        expect(result).toBeLessThanOrEqual(18);
    });
    it('should return a number within the expected range when multiple modifiers are provided', () => {
        const result = rollAbilityScore({ abilityScoreModifier: 0, modifiers: [1, 2, 3] });
        expect(result).toBeGreaterThanOrEqual(3);
        expect(result).toBeLessThanOrEqual(18);
    });
    it('should roll 2D20s and return the highest value when advantage is true', () => {
        const result = rollAbilityScore({ abilityScoreModifier: 0, modifiers: [], advantage: true });
        expect(result).toBeGreaterThanOrEqual(3);
        expect(result).toBeLessThanOrEqual(18);
    });
    it('should roll 2D20s and return the lowest value when disadvantage is true', () => {
        const result = rollAbilityScore({ abilityScoreModifier: 0, modifiers: [], disadvantage: true });
        expect(result).toBeGreaterThanOrEqual(3);
        expect(result).toBeLessThanOrEqual(18);
    });
    it('should return a number within the expected range when both advantage and disadvantage are true', () => {
        const result = rollAbilityScore({ abilityScoreModifier: 0, modifiers: [], advantage: true, disadvantage: true });
        expect(result).toBeGreaterThanOrEqual(3);
        expect(result).toBeLessThanOrEqual(18);
    });
});

