# Dicecaster

A game-agnostic dice rolling library with a keep-highest/keep-lowest strategy, extendable via packages for specific game systems (currently D&D).

## Packages

- **@dicecaster/core** — game-agnostic dice rolling primitives
- **@dicecaster/dnd** — D&D 5e rules built on top of core
- **dicecaster** — deprecated shim re-exporting @dicecaster/core

Game-specific terminology belongs in each package's own documentation, not here. This glossary covers only concepts shared across the core library.

## Language

### Core

**Die**:
A single polyhedral cube with a fixed number of sides. Standard types are D4, D6, D8, D10, D12, D20, and D100. Arbitrary side counts are also supported via `{ sides: number }`.
_Avoid_: Cube, roller

**Roll**:
The act of generating one or more random integers between 1 and the number of sides on a Die. A Roll may produce multiple values when `count` exceeds 1.
_Avoid_: Cast, throw, spin

**Keep Strategy**:
A filter applied after rolling that selects which values contribute to the final sum. `keep: "highest"` retains the N highest rolls; `keep: "lowest"` retains the N lowest. Without a Keep Strategy, all rolled values are kept.
_Avoid_: Drop, discard, advantage, disadvantage

**Dice Pool**:
A collection of one or more groups of dice, where each group specifies a quantity and a Die type. Rolling a pool returns the individual results per group rather than a summed total.
_Avoid_: Batch roll, multi-roll

**Modifier**:
A numeric adjustment applied after rolling and keeping. Multiple modifiers sum together before being added to the roll result.
_Avoid_: Bonus, penalty, adjustment

**RNG**:
The random number generator function used to produce roll values. Defaults to `Math.random()`, but can be injected for testing, seeding, or deterministic gameplay.
_Avoid_: Randomizer, seed function
