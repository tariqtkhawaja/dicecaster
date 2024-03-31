import { rollDie } from './rollDie';

export interface RollD20 {
    advantage?: boolean;
    disadvantage?: boolean;
}

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
