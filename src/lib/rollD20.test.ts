import { rollD20 } from './rollD20';

jest.mock('./rollDie', () => ({
    rollDie: jest.fn().mockReturnValue(10),
}));

describe('rollD20', () => {

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should return a number within the expected range', () => {
        const result = rollD20();
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(20);
    });
    it(`should roll 2d20's and return the highest value`, () => {
        const mockRollDie = require('./rollDie').rollDie;
        mockRollDie.mockReturnValueOnce(20);
        mockRollDie.mockReturnValueOnce(1);

        const result = rollD20({ advantage: true });
        expect(result).toBe(20);
    });
    it(`should roll 2d20's and return the lowest value`, () => {
        const mockRollDie = require('./rollDie').rollDie;
        mockRollDie.mockReturnValueOnce(20);
        mockRollDie.mockReturnValueOnce(1);

        const result = rollD20({ disadvantage: true });
        expect(result).toBe(1);
    });
    it(`should return a number within the expected range when both advantage and disadvantage are true`, () => {
        const mockRollDie = require('./rollDie').rollDie;
        mockRollDie.mockReturnValueOnce(20);
        mockRollDie.mockReturnValueOnce(1);

        const result = rollD20({ advantage: true, disadvantage: true });
        expect(result).toBe(20);
    });
});
