import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useDicePool } from "./useDicePool";

// Roll the dice
// either add them, get the higest, or get the lowest
// if there is a die based modifer
//   roll the dice modifer pool and add it to the first pool result
// if there are any static modifers
//   add it to the first pool result

// rollDie
// rollDicePool

// rollSkillCheck
/*
{
    bonuses: [2, 'd4'], 
    proficiency: 'none', // 'none' | proficientcy | expertise
    skillModifier: 5, // skill based modifier 
    position: 'advantage' // 'advantage' | 'disadvantage | 'standard'
}
*/
// rollSavingThrow

// rollAttack

// rollDie

// useDicePool
/*
input
{
    dice: {
        d20: {
            amount: 2,
            mode: 'advantage'
        },
        d4: 1
    }, 
    modifiers = [],
}
*/

// {
//     value: 21
//     advantage: true | false
//     disadvantage: true | false
//     results: [
//         {
//             sides: 20,
//             value: 16,
//         },

//         {
//             sides: 20,
//             value: 9
//         }
//     ],
//     modifiers: [
//         5
//     ],
//     roll
// }
describe("useDicePool", () => {
  it("should return the total value of the dice in the dice pool for 'sum' mode", () => {
    const renderedHook = renderHook(() =>
      useDicePool({
        dice: {
          d4: { amount: 1, mode: "sum" },
          d6: { amount: 2, mode: "sum" },
          d8: { amount: 4, mode: "sum" },
          d10: { amount: 7, mode: "sum" },
          d12: { amount: 9, mode: "sum" },
          d20: { amount: 15, mode: "sum" },
          d100: { amount: 64, mode: "sum" },
        },
        modifiers: [5, 2, 5],
      })
    );

    const dicePool = renderedHook.result.current;

    const total = dicePool.result.reduce((a: number, b: number) => a + b, 0);

    expect(total).toBeGreaterThanOrEqual(103); // 1*1 + 2*1 + 4*1 + 7*1 + 9*1 + 15*1 + 64*1 + 5 + 2 + 5
    expect(total).toBeLessThanOrEqual(6400); // 1*4 + 2*6 + 4*8 + 7*10 + 9*12 + 15*20 + 64*100 + 5 + 2 + 5
  });

  it("should return the total value of the dice in the dice pool for 'highest' mode", () => {
    const renderedHook = renderHook(() =>
      useDicePool({
        dice: {
          d4: { amount: 1, mode: "highest" },
          d6: { amount: 2, mode: "highest" },
          d8: { amount: 4, mode: "highest" },
          d10: { amount: 7, mode: "highest" },
          d12: { amount: 9, mode: "highest" },
          d20: { amount: 15, mode: "highest" },
          d100: { amount: 64, mode: "highest" },
        },
        modifiers: [5, 2, 5],
      })
    );

    const dicePool = renderedHook.result.current;

    const total = dicePool.result.reduce((a, b) => a + b, 0);

    expect(total).toBeGreaterThanOrEqual(7); // 1 + 1 + 1 + 1 + 1 + 1 + 1 + 5 + 2 + 5
    expect(total).toBeLessThanOrEqual(142); // 4 + 6 + 8 + 10 + 12 + 20 + 100 + 5 + 2 + 5
  });

  it("should return the total value of the dice in the dice pool for 'lowest' mode", () => {
    const renderedHook = renderHook(() =>
      useDicePool({
        dice: {
          d4: { amount: 1, mode: "lowest" },
          d6: { amount: 2, mode: "lowest" },
          d8: { amount: 4, mode: "lowest" },
          d10: { amount: 7, mode: "lowest" },
          d12: { amount: 9, mode: "lowest" },
          d20: { amount: 15, mode: "lowest" },
          d100: { amount: 64, mode: "lowest" },
        },
        modifiers: [5, 2, 5],
      })
    );

    const dicePool = renderedHook.result.current;

    const total = dicePool.result.reduce((a, b) => a + b, 0);

    expect(total).toBeGreaterThanOrEqual(7); // 1 + 1 + 1 + 1 + 1 + 1 + 1 + 5 + 2 + 5
    expect(total).toBeLessThanOrEqual(142); // 4 + 6 + 8 + 10 + 12 + 20 + 100 + 5 + 2 + 5
  });
});
