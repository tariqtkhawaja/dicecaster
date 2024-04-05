/**
 * 
 * @param modifiers An array of numbers to be summed.
 * @returns the sum of the modifiers.
 * @example
 *  
 * ```js
 * sumModifiers([1, 2, 3]) // 6
 * ```
 */
export const sumModifiers = (modifiers: number[] = []) => modifiers.reduce((acc, modifier) => acc + modifier, 0)