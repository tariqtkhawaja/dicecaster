import { rollDamageDice } from "..";
import { DieConfig } from "../dice-roller";

describe('rollDamageDice', () => {
    const dice: DieConfig[] = [
        { type: 'D6', amount: 2 },
        { type: 'D8', amount: 1 }
    ]
    const modifiers = [2, 3, 4]
    const doubleDamage = true

    it('should return an object with the correct properties', () => {
        const roll = rollDamageDice({ dice, modifiers, doubleDamage })

        expect(roll).toHaveProperty('damage')
        expect(roll).toHaveProperty('originalDamage')
        expect(roll).toHaveProperty('modifiers')
        expect(roll).toHaveProperty('doubleDamage')
    })

    it('should return the correct damage', () => {
        const roll = rollDamageDice({ dice, modifiers })

        expect(roll.damage).toBeGreaterThanOrEqual(7)
        expect(roll.damage).toBeLessThanOrEqual(29)
    })

    it('should return the correct originalDamage', () => {
        const roll = rollDamageDice({ dice, modifiers })

        expect(roll.originalDamage).toBeGreaterThanOrEqual(1)
        expect(roll.originalDamage).toBeLessThanOrEqual(20)
    })

    it('should return the correct originalDamage with doubleDamage', () => {
        const roll = rollDamageDice({ dice, modifiers, doubleDamage })

        expect(roll.originalDamage).toBeGreaterThanOrEqual(1)
        expect(roll.originalDamage).toBeLessThanOrEqual(20)
    })

    it('should return the correct modifiers', () => {
        const roll = rollDamageDice({ dice, modifiers, doubleDamage })

        expect(roll.modifiers).toStrictEqual([2, 3, 4])
    })


})