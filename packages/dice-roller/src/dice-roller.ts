export type DieType = "D4" | "D6" | "D8" | "D10" | "D12" | "D20" | "D100";

const dieSidesMap: Record<DieType, number> = {
  D4: 4,
  D6: 6,
  D8: 8,
  D10: 10,
  D12: 12,
  D20: 20,
  D100: 100,
};

export interface Die {
  amount: number;
  type: DieType;
}

export interface D20 extends Die {
  withAdvantage?: boolean;
  withDisadvantage?: boolean;
}

export interface DieConfig extends Partial<Record<DieType, Die>> {
  D20?: D20;
}

export function getNumberOfSides(die: Die): number {
  return dieSidesMap[die.type];
}

export function calculateRoll(numberOfSides: number) {
  return Math.floor(Math.random() * numberOfSides) + 1;
}

export function rollDice(die: Die): number[] {
  const numberOfSides = getNumberOfSides(die);
  return Array.from({ length: die.amount }, () => calculateRoll(numberOfSides));
}

export function rollDicePool(die: Die): number {
  return rollDice(die).reduce((acc, sum) => acc + sum, 0);
}

export function rollD20WithAdvantage(): number {
  const rolls = rollDice({ amount: 2, type: "D20" });
  return Math.max(...rolls);
}

export function rollD20WithDisadvantage(): number {
  const rolls = rollDice({ amount: 2, type: "D20" });
  return Math.min(...rolls);
}

export function rollD20(die: D20): number {
  const standardPosition = !die.withAdvantage && !die.withDisadvantage;
  const cancelledOutPosition = die.withAdvantage && die.withDisadvantage;

  if (!standardPosition && !cancelledOutPosition) {
    if (die.withAdvantage) {
      return rollD20WithAdvantage();
    }
    if (die.withDisadvantage) {
      return rollD20WithDisadvantage();
    }
  }

  return rollDicePool(die);
}

export function rollDie(
  dieConfig: DieConfig,
  modifiers: number[] = []
): number[] {
  const dice = Object.values(dieConfig);
  const diceRolls = dice.map((die) => {
    if (die.type === "D20") {
      return rollD20(die);
    }
    return rollDicePool(die) + modifiers.reduce((acc, sum) => acc + sum, 0);
  });
  return diceRolls;
}
