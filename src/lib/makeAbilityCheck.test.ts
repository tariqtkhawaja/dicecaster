import { makeAbilityCheck } from './makeAbilityCheck';
import type { AbilityCheckConfig, CheckResult } from './rollAbilityScore';

jest.mock('./rollD20', () => ({
    rollD20: jest.fn(),
}));

describe('makeAbilityCheck', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return a CheckResult with the correct properties', () => {
        const abilityCheckConfig: AbilityCheckConfig = {
            abilityScoreModifier: 2,
        };
        const difficultyClass = 15;

        const mockRollD20 = require('./rollD20').rollD20;
        mockRollD20.mockReturnValue(10);

        const result = makeAbilityCheck({ abilityCheckConfig, difficultyClass });

        expect(result).toHaveProperty('abilityScoreModifier', 2);
        expect(result).toHaveProperty('advantage', false);
        expect(result).toHaveProperty('disadvantage', false);
        expect(result).toHaveProperty('modifiers', []);
        expect(result).toHaveProperty('result', 10);
        expect(result).toHaveProperty('resultBeforeModifers', 10);
        expect(result).toHaveProperty('critical', false);
        expect(result).toHaveProperty('success', false);
        expect(result).toHaveProperty('failure', true);
    });

    it('should correctly determine success and failure', () => {
        const mockRollD20 = require('./rollD20').rollD20;
        const abilityCheckConfig: AbilityCheckConfig = {
            abilityScoreModifier: 2,
        };
        const difficultyClass = 15;

        mockRollD20.mockReturnValueOnce(16);
        const resultSuccess = makeAbilityCheck({ abilityCheckConfig, difficultyClass });

        mockRollD20.mockReturnValueOnce(12);
        const resultFailure = makeAbilityCheck({ abilityCheckConfig, difficultyClass });

        expect(resultSuccess.success).toBe(true);
        expect(resultSuccess.failure).toBe(false);
        expect(resultFailure.success).toBe(false);
        expect(resultFailure.failure).toBe(true);
    });

    it('should correctly determine critical success and failure', () => {
        const abilityCheckConfig: AbilityCheckConfig = {
            abilityScoreModifier: 2,
        };
        const difficultyClass = 15;

        const mockRollD20 = require('./rollD20').rollD20;
        mockRollD20.mockReturnValueOnce(20);
        const resultCriticalSuccess = makeAbilityCheck({ abilityCheckConfig, difficultyClass });

        mockRollD20.mockReturnValueOnce(1);
        const resultCriticalFailure = makeAbilityCheck({ abilityCheckConfig, difficultyClass });

        expect(resultCriticalSuccess.critical).toBe(true);
        expect(resultCriticalFailure.critical).toBe(true);
    });
});