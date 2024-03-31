import type { DieType } from '../dice-roller.ts';

const dieSidesMap: Record<DieType, number> = {
    D4: 4,
    D6: 6,
    D8: 8,
    D10: 10,
    D12: 12,
    D20: 20,
    D100: 100,
};

export const getNumberOfSides = (type: DieType) => {
    return dieSidesMap[type];
}

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
