# DnD Dice Roller

import { roll, rollD20 } from 'dnd-dice-roller

# Design Notes

```ts


private
React App

rollDie(4)



diceroller.makeSavingThrow()

const { log, makeAttackRoll } = useDiceRoll()

log.getLastRoll()

makeAttackRoll() = rollWithAdvantage() => 2 x rollDie(20) -> take the highest
makeAttackRoll() = rollWithDisadvantage() => 2 x rollDie(20) -> take the lowest

rollDie()
roll(numberOfSides = 20) = rollDie(numberOfSides)
rollD100() = rollDie(100)
rollD20() = rollDie(20)
rollD100() = rollDie(100)
rollD100() = rollDie(100)



const result = rollD20() // useDice(20)



rollD20WithAdvantage({
  modifiers: [
    'd4', 1
  ]
})

roll().plus(2)

rollD20().withAdvantage().withD4().plus(3) // roll 2d20, take the heights, add a d4 and add 3.



let value = 0;
value += rollD20()
value += plus(2)
value += rollD6(3).plus(2) // roll 3d6, add up the results and add 2

return value


makeAttackRoll({ modifier: 4, advantage: true }).withD4().plus(3)


```
