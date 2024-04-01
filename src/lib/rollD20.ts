import { rollDie } from './rollDie';

/**
 * @function rollD20
 * An object that contains the properties for rolling a D20.
 * @property advantage A boolean value to determine if the roll has advantage.
 * @property disadvantage A boolean value to determine if the roll has disadvantage.
 * @returns a random number between 1 and 20.
 */
export interface RollD20 {
    advantage?: boolean;
    disadvantage?: boolean;
}
/**
 * This function rolls a 20 sided die and returns the result.
 * @param advantage A boolean value to determine if the roll has advantage.
 * @param disadvantage A boolean value to determine if the roll has disadvantage.
 * @returns a random number between 1 and 20.
 */
export const rollD20 = ({ advantage, disadvantage }: RollD20 = {
    advantage: false,
    disadvantage: false
}) => {
    const cancelledOutAdvantage = advantage && disadvantage;

    if ((advantage || disadvantage) && !cancelledOutAdvantage) {
        const rolls = Array.from({ length: 2 }, () => rollDie('D20'));

        if (advantage && !disadvantage) {
            return Math.max(...rolls)
        }
        else if (!advantage && disadvantage) {
            return Math.min(...rolls)
        }
    }

    return rollDie('D20')
}
