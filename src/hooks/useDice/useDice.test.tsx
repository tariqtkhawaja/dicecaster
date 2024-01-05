import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useDice, rollDie } from "./useDice";

describe("rollDie", () => {
  it("should return a number between 1 and 4", () => {
    const result = rollDie(4);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(4);
  });
});

describe("useDice", () => {
  it("a roll of a d4 should return a number between 1 and 4", () => {
    const { result } = renderHook(() => useDice(4));

    act(() => {
      result.current.roll();
    });

    expect(result.current.value).toBeGreaterThanOrEqual(1);
    expect(result.current.value).toBeLessThanOrEqual(4);
  });

  it("should have six values stored in the roll history after roll() has been called 6 times", () => {
    const { result } = renderHook(() => useDice(6));

    act(() => {
      new Array(6).fill(0).forEach(() => result.current.roll());
    });

    expect(result.current.history.length).toBe(6);
    expect(result.current.value).toBe(result.current.history.pop());
  });
});
