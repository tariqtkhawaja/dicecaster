import type { DieType } from '../dice-roller.ts';
/**
 *  @type DieType
 *  @param type DieType
 * 
 */

const dieSidesMap: Record<DieType, number> = {
    D4: 4,
    D6: 6,
    D8: 8,
    D10: 10,
    D12: 12,
    D20: 20,
    D100: 100,
};

/**
 * @function getNumberOfSides
 * @param type DieType
 * @returns the number of sides of a specificed die type.
 */
export const getNumberOfSides = (type: DieType) => {
    return dieSidesMap[type];
}

/**
 * @function calculateRollResult
 * calculates the result of a roll.
 * @param numberOfSides the number of sides of the die.
 * @returns the randomised result of a specificed die type.
 */
export const calculateRollResult = (numberOfSides: number) => {
    return Math.floor(Math.random() * numberOfSides) + 1;
}

/**
 * Rolls a die of a given type.
 *
 * @param DieType the type of die to be rolled.
 * @returns the randomised result of a specificed die type.
 */
export const rollDie = (type: DieType) => {
    const numberOfSides = getNumberOfSides(type);
    return calculateRollResult(numberOfSides);
}
