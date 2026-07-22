import type { AbilityCheckConfig, CheckResult } from './rollAbilityScore';
import { rollAbilityScore } from './rollAbilityScore'

export interface AttackRollConfig extends Omit<AbilityCheckConfig, "abilityScoreModifier"> {
    attackRollModifier: number;
}

export interface MakeAttackRoll {
    attackRollConfig: AbilityCheckConfig;
    armorClass: number;
}
/**
 * @function makeAttackRoll
 * This function rolls a d20 and returns the result.W
 * @param AbilityCheckConfig The configuration for the ability check.
 * @param armorClass The armor class of the target.
 * @returns A CheckResult object.
 */
export const makeAttackRoll = ({ attackRollConfig, armorClass }: MakeAttackRoll): CheckResult => {
    const check = rollAbilityScore(attackRollConfig)
    return {
        ...check,
        critical: check.resultBeforeModifers === 1 || check.resultBeforeModifers === 20,
        failure: check.result < armorClass,
        success: check.result >= armorClass,
    }
}
