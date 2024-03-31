import type { AbilityCheckConfig, CheckResult } from './rollAbilityScore';
import { rollAbilityScore } from './rollAbilityScore';

export interface MakeAbilityCheck {
    abilityCheckConfig: AbilityCheckConfig;
    difficultyClass: number,
    modifiers: number[]
}

export const makeAbilityCheck = ({ abilityCheckConfig, difficultyClass, modifiers = [] }: MakeAbilityCheck): CheckResult => {
    const check = rollAbilityScore(abilityCheckConfig)
    return {
        ...check,
        critical: check.resultBeforeModifers === 1 || check.resultBeforeModifers === 20,
        failure: check.result < difficultyClass,
        success: check.result >= difficultyClass,
    }
}
