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
    totalModifiers: number;
}
/**
 * @function rollAbilityScore
 *  This function rolls a 20 sided die and returns the result.
 * @param advantage A boolean value to determine if the roll has advantage. 
 * @returns a random number between 1 and 20.
 */
export const rollAbilityScore = ({ advantage = false, disadvantage = false, abilityScoreModifier, modifiers = [] }: AbilityCheckConfig): CheckResult => {
    const result = rollD20({ advantage, disadvantage })
    const totalModifiers = sumModifiers(modifiers)

    return {
        abilityScoreModifier,
        advantage,
        disadvantage,
        modifiers,
        totalModifiers,
        resultBeforeModifers: result,
        result: result + totalModifiers,
    }

}