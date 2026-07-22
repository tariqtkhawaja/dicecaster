# @dicecaster/dnd

D&D 5e mechanics built on top of `@dicecaster/core`.

## Install

```bash
npm i @dicecaster/dnd
```

Requires `@dicecaster/core` as a peer dependency (installed automatically).

## API

### `makeAbilityCheck(config)`

Roll a d20 against a Difficulty Class.

```ts
interface AbilityCheckConfig {
  dc: number;
  modifier: number;
  advantage?: boolean;
  disadvantage?: boolean;
}

// → { success, failure, critical, ...rollResult }
const result = makeAbilityCheck({ dc: 15, modifier: 3 });
```

### `makeAttackRoll(config)`

Roll a d20 against an Armor Class.

```ts
interface AttackRollConfig {
  armorClass: number;
  modifier: number;
  advantage?: boolean;
  disadvantage?: boolean;
}

// → { hit, miss, critical, ...rollResult }
const result = makeAttackRoll({ armorClass: 16, modifier: 5 });
```

### `rollDamage(config)`

Roll damage dice with optional crit doubling and modifiers.

```ts
interface DamageConfig {
  dice: { type: DieType; amount: number }[];
  crit?: boolean;
  modifiers?: number[];
}

// 2d6 + 3 damage
const result = rollDamage({ dice: [{ type: "D6", amount: 2 }], modifiers: [3] });

// Crit: double the dice
const critHit = rollDamage({
  dice: [{ type: "D6", amount: 2 }],
  crit: true,
  modifiers: [3],
});
```

### `isCritical(rawRoll)`

Returns `true` for a natural 1 or 20.

```ts
isCritical(20); // true
isCritical(1);  // true
isCritical(15); // false
```
