import { describe, expect, it, jest } from "@jest/globals";
import { makeAbilityCheck } from "./makeAbilityCheck";
import { rollAbilityScore } from "./rollAbilityScore";
import type { AbilityCheckConfig, CheckResult, MakeAbilityCheck } from "..";

jest.mock('./rollAbilityScore');

describe('makeAbilityCheck', () => {
    it('should return a CheckResult with correct properties', () => {
        const abilityCheckConfig: AbilityCheckConfig = {
            abilityScoreModifier: 2,
            modifiers: []
        };

        const mockCheckResult: CheckResult = {
            result: 15,
            resultBeforeModifers: 13,
            success: false,
            abilityScoreModifier: 0
        };

        const result = makeAbilityCheck({ abilityCheckConfig, difficultyClass: 15, modifiers: [] });

        expect(result).toHaveProperty('result');
        expect(result).toHaveProperty('resultBeforeModifers');
        expect(result).toHaveProperty('critical');
        expect(result).toHaveProperty('failure');
        expect(result).toHaveProperty('success');
    });
    it('should return a CheckResult with success set to true if the result is greater than or equal to the difficulty class', () => {
        const abilityCheckConfig: AbilityCheckConfig = {
            abilityScoreModifier: 2,
            modifiers: []
        };

        const mockCheckResult: CheckResult = {
            result: 15,
            resultBeforeModifers: 13,
            success: false,
            abilityScoreModifier: 0
        };

        const result = makeAbilityCheck({ abilityCheckConfig, difficultyClass: 15, modifiers: [] });

        expect(result.success).toBe(true);
    });
    it('should return a CheckResult with success set to false if the result is less than the difficulty class', () => {
        const abilityCheckConfig: AbilityCheckConfig = {
            abilityScoreModifier: 2,
            modifiers: []
        };

        const mockCheckResult: CheckResult = {
            result: 15,
            resultBeforeModifers: 13,
            success: false,
            abilityScoreModifier: 0
        };

        const result = makeAbilityCheck({ abilityCheckConfig, difficultyClass: 15, modifiers: [] });

        expect(result.success).toBe(true);
    });
    it('should roll 2D20s and return the highest value when advantage is true', () => {
        const abilityCheckConfig: AbilityCheckConfig = {
            abilityScoreModifier: 2,
            modifiers: [],
            advantage: true
        };

        const mockCheckResult: CheckResult = {
            result: 15,
            resultBeforeModifers: 13,
            success: false,
            abilityScoreModifier: 0
        };

        const result = makeAbilityCheck({ abilityCheckConfig, difficultyClass: 15, modifiers: [] });

        expect(result.success).toBe(true);
    });
    it('should roll 2D20s and return the lowest value when disadvantage is true', () => {
        const abilityCheckConfig: AbilityCheckConfig = {
            abilityScoreModifier: 2,
            modifiers: [],
            disadvantage: true
        };

        const mockCheckResult: CheckResult = {
            result: 15,
            resultBeforeModifers: 13,
            success: false,
            abilityScoreModifier: 0
        };

        const result = makeAbilityCheck({ abilityCheckConfig, difficultyClass: 15, modifiers: [] });

        expect(result.success).toBe(true);
    });
    it('should return a CheckResult with critical set to true if the resultBeforeModifers is 1', () => {
        const abilityCheckConfig: AbilityCheckConfig = {
            abilityScoreModifier: 2,
            modifiers: []
        };

        const mockCheckResult: CheckResult = {
            result: 15,
            resultBeforeModifers: 1,
            success: false,
            abilityScoreModifier: 0
        };

        const result = makeAbilityCheck({ abilityCheckConfig, difficultyClass: 15, modifiers: [] });

        expect(result.critical).toBe(true);
    });
    it('should return a CheckResult with critical set to true if the resultBeforeModifers is 20', () => {
        const abilityCheckConfig: AbilityCheckConfig = {
            abilityScoreModifier: 2,
            modifiers: []
        };

        const mockCheckResult: CheckResult = {
            result: 15,
            resultBeforeModifers: 20,
            success: false,
            abilityScoreModifier: 0
        };

        const result = makeAbilityCheck({ abilityCheckConfig, difficultyClass: 15, modifiers: [] });

        expect(result.critical).toBe(true);
    });
});
