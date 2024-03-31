import type { AbilityCheckConfig, CheckResult } from './rollAbilityScore';
import { rollAbilityScore } from './rollAbilityScore'

export interface AttackRollConfig extends Omit<AbilityCheckConfig, "abilityScoreModifier"> {
    attackRollModifier: number;
}

export interface MakeAttackRoll {
    attackRollConfig: AbilityCheckConfig;
    armorClass: number;
}

export const makeAttackRoll = ({ attackRollConfig, armorClass }: MakeAttackRoll): CheckResult => {
    const check = rollAbilityScore(attackRollConfig)
    return {
        ...check,
        critical: check.resultBeforeModifers === 1 || check.resultBeforeModifers === 20,
        failure: check.result < armorClass,
        success: check.result >= armorClass,
    }
}
