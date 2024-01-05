import { rollDie } from "../useDice";
import { useState } from "react";

type DiceRollMode = "sum" | "highest" | "lowest";

type DieConfig =
  | number
  | {
      amount: number;
      mode?: DiceRollMode;
    };

type DiceConfig = {
  d4?: DieConfig;
  d6?: DieConfig;
  d8?: DieConfig;
  d10?: DieConfig;
  d12?: DieConfig;
  d20?: DieConfig;
  d100?: DieConfig;
};

type UseDicePoolProps = {
  dice: DiceConfig;
  modifiers: number[];
};

export const useDicePool = ({ dice, modifiers }: UseDicePoolProps) => {
  const [result, setResult] = useState<number[]>([]);
  const [modified, setModified] = useState<number>(0);

const roll = () => {
  const result = Object.entries(dice).reduce((acc, [die, config]) => {
    const { amount, mode } =
      typeof config === "number" ? { amount: config, mode: "sum" } : config;
    const rolls = Array.from({ length: amount }, () =>
      rollDie(parseInt(die.slice(1)))
    );
    const sorted = rolls.sort((a, b) => a - b);
    let result;
    switch (mode) {
      case "highest":
        result = [Math.max(...sorted)];
        break;
      case "lowest":
        result = [Math.min(...sorted)];
        break;
      case "sum":
      default:
        result = [sorted.reduce((a, b) => a + b, 0)];
        break;
    }
    return [...acc, ...result];
  }, [] as number[]);

  const modified =
    result.reduce((acc, r) => acc + r, 0) +
    modifiers.reduce((acc, m) => acc + m, 0);

  setResult(result);
  setModified(modified);
};

  return {
    roll,
    result,
    modified,
  };
};
