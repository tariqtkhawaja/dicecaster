import type { AbilityCheckConfig, CheckResult } from './rollAbilityScore';
import { rollAbilityScore } from './rollAbilityScore';

export interface MakeAbilityCheck {
    abilityCheckConfig: AbilityCheckConfig;
    difficultyClass: number,
    modifiers?: number[]
}

/**
 * This function rolls a d20 and returns the result.
 * @param abilityCheckConfig The configuration for the ability check. 
 * @returns A CheckResult object.
 */

export const makeAbilityCheck = ({ abilityCheckConfig, difficultyClass, modifiers = [] }: MakeAbilityCheck): CheckResult => {
    const check = rollAbilityScore({ ...abilityCheckConfig })
    return {
        ...check,
        critical: check.resultBeforeModifers === 1 || check.resultBeforeModifers === 20,
        failure: check.result < difficultyClass,
        success: check.result >= difficultyClass,
    }
}
