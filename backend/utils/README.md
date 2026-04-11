# Utils

Pure utility functions for dice rolling and stat calculations. These use **ES6 module** syntax (`export`).

> **Note:** These files are not directly imported by the CommonJS services in production. They serve as the source-of-truth implementations. The frontend has local copies in `frontend/src/lib/guest-utils.js` for guest mode.

## `dice.js`

All dice-related operations.

| Export                  | Description                                    |
|-------------------------|------------------------------------------------|
| `rollDie(sides)`        | Roll a single die (e.g., `rollDie(20)`)        |
| `rollMultiple(count, sides)` | Roll multiple dice, get total + individual rolls |
| `rollNotation(notation)` | Parse `"2d6+3"` → `{ total, rolls, modifier }` |
| `rollD20()`             | Shorthand for `rollDie(20)`                    |
| `rollWithAdvantage()`   | Roll 2d20, take higher                         |
| `rollWithDisadvantage()` | Roll 2d20, take lower                         |
| `statCheck(modifier, dc, rollType)` | Full stat check with critical detection |
| `rollInitiative(dexMod)` | d20 + dex modifier                            |
| `rollDamage(notation, isCritical)` | Damage roll with optional crit double |

## `stats.js`

Character stat calculations. Imports from `../config/game-config`.

| Export                   | Description                          |
|--------------------------|--------------------------------------|
| `getModifier(score)`     | D&D 5e formula: `floor((score-10)/2)` |
| `formatModifier(mod)`    | Format as `"+3"` or `"-1"`          |
| `getModifierString`      | Alias for `formatModifier`           |
| `rollStat()`             | 4d6 drop lowest (returns 3–18)       |
| `rollStatArray()`        | Roll all 6 ability scores            |
