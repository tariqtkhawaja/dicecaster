# Dicecaster

A library for simulating D&D dice rolls, from raw die results to full ability checks and attack resolution.

## Language

**Die**:
A single polyhedral cube with a fixed number of sides. The supported types are D4, D6, D8, D10, D12, D20, and D100.
_Avoid_: Cube, roller

**Roll**:
The act of generating a random integer between 1 and the number of sides on a Die. A single Roll produces one numeric result.
_Avoid_: Cast, throw, spin

**Dice Pool**:
A collection of one or more groups of dice, where each group specifies a quantity and a Die type. Rolling a pool returns the individual results per group rather than a summed total.
_Avoid_: Batch roll, multi-roll

**Advantage**:
A condition on a D20 Roll that causes two D20s to be rolled and the higher result kept. When both Advantage and Disadvantage apply simultaneously, they cancel and produce a normal single D20 Roll.
_Avoid_: Bonus roll, reroll

**Disadvantage**:
A condition on a D20 Roll that causes two D20s to be rolled and the lower result kept.
_Avoid_: Penalty roll

**Modifier**:
A numeric adjustment applied after rolling. Modifiers can originate from an ability score, a weapon property, a spell effect, or any other rule source. Multiple modifiers sum together before being added to the raw roll result.
_Avoid_: Bonus, penalty, adjustment

**Ability Check**:
A D20 Roll combined with modifiers, compared against a Difficulty Class to determine Success or Failure. A raw roll of 1 or 20 before modifiers is marked as Critical.
_Avoid_: Skill check, saving throw (unless those specific subtypes become distinct concepts)

**Difficulty Class**:
The threshold value an Ability Check's final result must meet or exceed to achieve Success.
_Avoid_: DC, target number

**Attack Roll**:
A D20 Roll combined with modifiers, compared against a target's Armor Class to determine whether the attack hits or misses. A raw roll of 1 or 20 before modifiers is marked as Critical.
_Avoid_: Hit roll, combat roll

**Armor Class**:
The threshold value an Attack Roll's final result must meet or exceed to hit the target.
_Avoid_: AC, defense rating

**Damage Roll**:
A Dice Pool whose results are summed, optionally doubled, then combined with modifiers to produce a total damage value.
_Avoid_: Damage dice, hurt roll

**Critical**:
A flag on an Ability Check or Attack Roll indicating the raw D20 result was a natural 1 or 20. Does not imply automatic success or failure — only marks the extremity of the roll.
_Avoid_: Nat 20, crit fail
