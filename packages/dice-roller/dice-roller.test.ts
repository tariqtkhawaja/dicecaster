import { rollDie } from "./index";

describe("rollDie", () => {
  it("should roll a D20 once when mode is not defined", () => {
    const result = rollDie({ d20: { amount: 1, numberOfSides: 20 } });
    expect(result[0]).toBeGreaterThanOrEqual(1);
    expect(result[0]).toBeLessThanOrEqual(20);
  });

  it('should roll a D20 once when mode is "normal"', () => {
    const result = rollDie({
      d20: { amount: 1, numberOfSides: 20, mode: "normal" },
    });
    expect(result[0]).toBeGreaterThanOrEqual(1);
    expect(result[0]).toBeLessThanOrEqual(20);
  });

  it('should roll a D20 twice and take the higher result when mode is "advantage"', () => {
    const results = Array.from(
      { length: 100 },
      () =>
        rollDie({ d20: { amount: 1, numberOfSides: 20, mode: "advantage" } })[0]
    );
    expect(Math.min(...results)).toBeGreaterThanOrEqual(2);
  });

  it('should roll a D20 twice and take the lower result when mode is "disadvantage"', () => {
    const results = Array.from(
      { length: 100 },
      () =>
        rollDie({
          d20: { amount: 1, numberOfSides: 20, mode: "disadvantage" },
        })[0]
    );
    expect(Math.max(...results)).toBeLessThanOrEqual(19);
  });

  it("should apply modifiers correctly", () => {
    const result = rollDie({ d20: { amount: 1, numberOfSides: 20 } }, [5]);
    expect(result[0]).toBeGreaterThanOrEqual(6);
    expect(result[0]).toBeLessThanOrEqual(25);
  });
});
