const dicecaster = require('./dist/index.js')


const res = dicecaster.rollDamageDice([{ type: 'D6', amount: 4 }, { type: 'D8', amount: 2 }])





//console.log(JSON.stringify({ check }, null, 2))

const damage = dicecaster.rollDamageDice({
    dice: [{ type: 'D6', amount: 4 }, { type: 'D8', amount: 2 }],
    doubledamage: true,
    modifiers: [2, 1]
})
console.log(JSON.stringify({ damage }, null, 2))

const attackRoll = dicecaster.makeAttackRoll({
    attackRollConfig: {
        abilityScoreModifier: 4,
        modifiers: [1]
    },
    armorClass: 15
})
console.log(JSON.stringify({ attackRoll }, null, 2))