import { rollD20 } from './rollD20'
import { sumModifiers } from './sumModifiers'

export interface AbilityCheckConfig {
    abilityScoreModifier: number;
    advantage?: boolean;
    disadvantage?: boolean;
    modifiers?: number[];
}
export interface CheckResult extends AbilityCheckConfig {
    result: number;
    resultBeforeModifers: number;
    critical?: boolean
    success?: boolean
    failure?: boolean
}

export const rollAbilityScore = ({ advantage = false, disadvantage = false, abilityScoreModifier, modifiers = [] }: AbilityCheckConfig): CheckResult => {
    const result = rollD20({ advantage, disadvantage })
    return {
        abilityScoreModifier,
        advantage,
        disadvantage,
        modifiers,
        result: result + sumModifiers(modifiers),
        resultBeforeModifers: result
    }

}