type Die = {
  amount: number;
  numberOfSides: number;
};

type D20 = {
  amount: number;
  numberOfSides: number;
  mode?: "advantage" | "disadvantage" | "normal";
};

interface DieConfig {
  d4?: Die;
  d6?: Die;
  d8?: Die;
  d10?: Die;
  d12?: Die;
  d20?: D20;
  d100?: Die;
}

export function rollDie(
  dieConfig: DieConfig,
  modifiers: number[] = []
): number[] {
  const rolls = Object.entries(dieConfig).flatMap(([dieType, die]) => {
    if (dieType === "d20" && die?.mode) {
      const rolls = Array.from(
        { length: 2 },
        () => Math.floor(Math.random() * die.numberOfSides) + 1
      );
      switch (die.mode) {
        case "advantage":
          return [Math.max(...rolls)];
        case "disadvantage":
          return [Math.min(...rolls)];
        default: // "normal" or undefined
          return rolls;
      }
    }
    return Array.from(
      { length: die.amount },
      () => Math.floor(Math.random() * die.numberOfSides) + 1
    );
  });

  const result =
    rolls.reduce((sum, roll) => sum + roll, 0) +
    modifiers.reduce((sum, mod) => sum + mod, 0);

  return [result];
}

console.log(rollDie({ d20: { amount: 1, numberOfSides: 20 } }));
console.log(
  rollDie({ d20: { amount: 1, numberOfSides: 20, mode: "advantage" } })
);
console.log(
  rollDie({ d20: { amount: 1, numberOfSides: 20, mode: "disadvantage" } })
);
console.log(rollDie({ d20: { amount: 1, numberOfSides: 20, mode: "normal" } }));
