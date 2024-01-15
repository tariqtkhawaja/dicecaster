import { describe, expect, it } from "@jest/globals";

import { D20, Die, DieConfig } from "./dice-roller";

import {
  getNumberOfSides,
  calculateRoll,
  rollDice,
  rollDicePool,
  rollD20WithAdvantage,
  rollD20WithDisadvantage,
  rollD20,
  rollDie,
} from "./dice-roller";

describe("getNumberOfSides", () => {
  it("should return the correct number of sides for a die", () => {
    const die: Die = { amount: 1, type: "D6" };
    expect(getNumberOfSides(die)).toBe(6);
  });
});

describe("calculateRoll", () => {
  it("should return a number within the correct range", () => {
    const roll = calculateRoll(6);
    expect(roll).toBeGreaterThanOrEqual(1);
    expect(roll).toBeLessThanOrEqual(6);
  });
});

describe("rollDice", () => {
  it("should return an array with the correct number of rolls", () => {
    const die: Die = { amount: 2, type: "D6" };
    const rolls = rollDice(die);
    expect(rolls.length).toBe(2);
  });

  it("should return an array with rolls within the correct range", () => {
    const die: Die = { amount: 2, type: "D6" };
    const rolls = rollDice(die);
    rolls.forEach((roll) => {
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(6);
    });
  });
});

describe("rollDicePool", () => {
  it("should return the correct total for multiple dice", () => {
    const die: Die = { amount: 2, type: "D6" };
    const roll = rollDicePool(die);
    expect(roll).toBeGreaterThanOrEqual(2);
    expect(roll).toBeLessThanOrEqual(12);
  });
});

describe("rollD20WithAdvantage", () => {
  it("should return a number within the correct range", () => {
    const roll = rollD20WithAdvantage();
    expect(roll).toBeGreaterThanOrEqual(1);
    expect(roll).toBeLessThanOrEqual(20);
  });
});

describe("rollD20WithDisadvantage", () => {
  it("should return a number within the correct range", () => {
    const roll = rollD20WithDisadvantage();
    expect(roll).toBeGreaterThanOrEqual(1);
    expect(roll).toBeLessThanOrEqual(20);
  });
});

describe("rollD20", () => {
  it("should return a number within the correct range", () => {
    const die: D20 = { amount: 1, type: "D20", withAdvantage: true };
    const roll = rollD20(die);
    expect(roll).toBeGreaterThanOrEqual(1);
    expect(roll).toBeLessThanOrEqual(20);
  });
});

describe("rollDie", () => {
  it("should return the correct totals for a dice pool and include modifiers", () => {
    const diceConfig: DieConfig = {
      D4: { amount: 4, type: "D4" },
      D20: { amount: 1, type: "D20", withAdvantage: true },
    };
    const modifiers = [1, 2];
    const rolls = rollDie(diceConfig, modifiers);
    const totalModifiers = modifiers.reduce((acc, curr) => acc + curr, 0);
    const totalRoll = rolls.reduce((acc, curr) => acc + curr, 0);

    expect(rolls.length).toBe(2);
    expect(totalRoll).toBeGreaterThanOrEqual(4 + 1 + totalModifiers); // 4 (minimum roll for 4 D4) + 1 (minimum roll for D20 with advantage) + total modifiers
    expect(totalRoll).toBeLessThanOrEqual(16 + 20 + totalModifiers); // 16 (maximum roll for 4 D4) + 20 (maximum roll for D20 with advantage) + total modifiers
  });

  it("should return the correct totals for a damage roll and include modifiers", () => {
    const diceConfig: DieConfig = {
      D6: { amount: 2, type: "D6" },
    };
    const modifiers = [1, 2];
    const rolls = rollDie(diceConfig, modifiers);
    const totalModifiers = modifiers.reduce((acc, curr) => acc + curr, 0);
    const totalRoll = rolls.reduce((acc, curr) => acc + curr, 0);
    expect(diceConfig.D6?.amount).toBe(2);
    expect(totalRoll).toBeGreaterThanOrEqual(2 * 1 + totalModifiers); // 2 (minimum roll for 2 D6) + total modifiers
    expect(totalRoll).toBeLessThanOrEqual(2 * 6 + totalModifiers); // 12 (maximum roll for 2 D6) + total modifiers
  });
});
