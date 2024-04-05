import { sumModifiers } from "./sumModifiers";
import { describe, it, expect } from "@jest/globals";

describe("sumModifiers", () => {
    it("should return the sum of all modifiers", () => {
        const modifiers = [1, 2, 3, 4, 5];
        const expected = 15;

        expect(sumModifiers(modifiers)).toBe(expected);
    });

    it("should return 0 if no modifiers are provided", () => {
        expect(sumModifiers()).toBe(0);
    });
    it("should return 0 if an empty array is provided", () => {
        expect(sumModifiers([])).toBe(0);
    });
    it("should return the sum of all modifiers if only one modifier is provided", () => {
        const modifier = 5;
        expect(sumModifiers([modifier])).toBe(modifier);
    });
});
