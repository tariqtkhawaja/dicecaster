# Dicecaster

A game-agnostic dice rolling library with a keep-highest/keep-lowest strategy, extendable via packages for specific game systems.

## Packages

| Package | Description |
|---|---|
| [@dicecaster/core](packages/core/) | Game-agnostic dice rolling primitives |
| [@dicecaster/dnd](packages/dnd/) | D&D 5e rules built on top of core |
| [dicecaster](packages/dicecaster/) | Deprecated shim — use `@dicecaster/core` instead |

## Quick start

```bash
npm i @dicecaster/core
```

```ts
import { roll } from "@dicecaster/core";

// Roll a single d6
roll({ die: "D6" });

// Roll 2d20, keep highest (advantage)
roll({ die: "D20", count: 2, keep: "highest", keepCount: 1 });

// 4d6 drop lowest (ability score generation)
roll({ die: "D6", count: 4, keep: "highest", keepCount: 3 });

// With modifiers
roll({ die: "D20", modifiers: [2, -1] });

// Custom die size
roll({ die: { sides: 7 } });

// Inject RNG for testing
roll({ die: "D6", rng: () => 0.5 });
```

## For D&D

See [@dicecaster/dnd](packages/dnd/) for ability checks, attack rolls, and damage.
