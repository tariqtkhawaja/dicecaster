import { rollDicePool } from './rollDicePool'
import { sumModifiers } from './sumModifiers'
import { DieConfig } from '../dice-roller'

interface DamageResult {
    damage: number;
    doubleDamage: boolean;
    modifiers: number[];
    originalDamage: number;
}


interface RollDamageDice {
    dice: DieConfig[];
    doubleDamage?: boolean;
    modifiers: number[]
}

export const rollDamageDice = ({ dice, doubleDamage = false, modifiers }: RollDamageDice): DamageResult => {
    const calaculateDamage = (accumulatedDamage: number, damage: number) => {
        return accumulatedDamage + damage
    }

    const totalDamage = rollDicePool(dice).reduce((total, { results }) => {
        return total + results.reduce(calaculateDamage, 0)
    }, 0)

    const modifiedDamage = (doubleDamage ? totalDamage * 2 : totalDamage) + sumModifiers(modifiers)

    return {
        damage: modifiedDamage,
        originalDamage: totalDamage,
        modifiers,
        doubleDamage
    }
}
