# @dicecaster/core

Game-agnostic dice rolling primitives.

## Install

```bash
npm i @dicecaster/core
```

## API

### `roll(config)`

Roll dice with optional keep strategy and modifiers.

```ts
interface RollConfig {
  die: DieType | { sides: number };
  count?: number;           // defaults to 1
  keep?: "highest" | "lowest";
  keepCount?: number;       // defaults to 1 when keep is set
  modifiers?: number[];
  rng?: () => number;      // injectable RNG
}

interface RollResult {
  raw: number[];            // all rolled values
  kept: number[];           // values after keep filter
  sum: number;              // sum of kept values
  modifierTotal: number;    // sum of modifiers
  total: number;            // sum + modifiers
}
```

**Examples:**

```ts
import { roll, rollHighest, rollLowest, sumModifiers } from "@dicecaster/core";

// Single d6
roll({ die: "D6" });

// 2d20 keep highest (advantage pattern)
roll({ die: "D20", count: 2, keep: "highest", keepCount: 1 });

// Convenience wrapper
rollHighest(2, 1, "D20");

// 4d6 drop lowest
rollHighest(4, 3, "D6");

// Arbitrary-sided die
roll({ die: { sides: 7 }, count: 3 });

// With modifiers
roll({ die: "D20", modifiers: [5, -2] });
// → { raw: [14], kept: [14], sum: 14, modifierTotal: 3, total: 17 }

// Deterministic RNG for testing
const seeded = () => 0.5; // always mid-range
roll({ die: "D6", rng: seeded });
```

### `sumModifiers(modifiers)`

Sum an array of numeric modifiers.

```ts
sumModifiers([2, -1, 3]); // → 4
```

### Die types

`"D4" | "D6" | "D8" | "D10" | "D12" | "D20" | "D100"` or `{ sides: number }` for arbitrary sizes.
