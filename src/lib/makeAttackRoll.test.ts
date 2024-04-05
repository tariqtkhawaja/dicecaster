import { makeAttackRoll } from './makeAttackRoll';
import { rollDice } from './rollDice';
import { rollAbilityScore } from './rollAbilityScore';
import type { AttackRollConfig, MakeAttackRoll } from './makeAttackRoll';
import type { AbilityCheckConfig, CheckResult } from '..';

jest.mock('./rollAbilityScore');

const mockRollAbilityScore = rollAbilityScore as jest.MockedFunction<typeof rollAbilityScore>;

mockRollAbilityScore.mockReturnValue({
    result: 15,
    resultBeforeModifers: 13,
    success: false,
    abilityScoreModifier: 0,
    modifiers: [],
    totalModifiers: 0
})

describe('makeAttackRoll', () => {
    it('should return a CheckResult with correct properties', () => {
        const attackRollConfig: AttackRollConfig = {
            attackRollModifier: 2,
        };

        const result = makeAttackRoll({ attackRollConfig: { abilityScoreModifier: 0 }, armorClass: 15 });

        expect(result).toHaveProperty('result');
        expect(result).toHaveProperty('resultBeforeModifers');
        expect(result).toHaveProperty('critical');
        expect(result).toHaveProperty('failure');
        expect(result).toHaveProperty('success');
    });
    it('should return a CheckResult with success set to true if the result is greater than or equal to the armor class', () => {
        const attackRollConfig: AttackRollConfig = {
            attackRollModifier: 2,
        };

        const result = makeAttackRoll({ attackRollConfig: { abilityScoreModifier: 0 }, armorClass: 15 });

        expect(result.success).toBe(true);
    });
    it('should return a CheckResult with success set to false if the result is less than the armor class', () => {
        const attackRollConfig: AttackRollConfig = {
            attackRollModifier: 2,
        };

        const result = makeAttackRoll({ attackRollConfig: { abilityScoreModifier: 0 }, armorClass: 16 });

        expect(result.success).toBe(false);
    }
    );
    it('should return a CheckResult with critical set to true if the resultBeforeModifers is 1', () => {
        const attackRollConfig: AttackRollConfig = {
            attackRollModifier: 2,
        };

        mockRollAbilityScore.mockReturnValueOnce({
            result: 15,
            resultBeforeModifers: 1,
            success: false,
            abilityScoreModifier: 0,
            modifiers: [],
            totalModifiers: 0
        })

        const result = makeAttackRoll({ attackRollConfig: { abilityScoreModifier: 0 }, armorClass: 16 });

        expect(result.critical).toBe(true);
    });
    it('should return a CheckResult with critical set to true if the resultBeforeModifers is 20', () => {
        const attackRollConfig: AttackRollConfig = {
            attackRollModifier: 2,
        };

        mockRollAbilityScore.mockReturnValueOnce({
            result: 15,
            resultBeforeModifers: 20,
            success: false,
            abilityScoreModifier: 0,
            modifiers: [],
            totalModifiers: 0
        })

        const result = makeAttackRoll({ attackRollConfig: { abilityScoreModifier: 0 }, armorClass: 16 });

        expect(result.critical).toBe(true);
    });
    it('should return a CheckResult with failure set to true if the result is less than the armor class', () => {
        const attackRollConfig: AttackRollConfig = {
            attackRollModifier: 2,
        };

        const result = makeAttackRoll({ attackRollConfig: { abilityScoreModifier: 0 }, armorClass: 16 });

        expect(result.failure).toBe(true);
    });
    it('should return a CheckResult with failure set to false if the result is greater than or equal to the armor class', () => {
        const attackRollConfig: AttackRollConfig = {
            attackRollModifier: 2,
        };

        const result = makeAttackRoll({ attackRollConfig: { abilityScoreModifier: 0 }, armorClass: 15 });

        expect(result.failure).toBe(false);
    });
});