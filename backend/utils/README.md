# Utilities Directory

Pure utility functions for game mechanics. These are stateless helpers that can be used anywhere.

## Files

### dice.js

Handles all dice rolling operations:

```javascript
import { 
  rollDie,        // Roll a single die
  rollMultiple,   // Roll multiple dice
  rollNotation,   // Parse "2d6+3" notation
  rollD20,        // Quick D20 roll
  statCheck,      // Full stat check with DC
  rollDamage      // Damage roll with critical support
} from '@/lib/utils/dice'

// Examples
const damage = rollNotation('2d6+3')
// { total: 11, rolls: [4, 4], modifier: 3, notation: '2d6+3' }

const check = statCheck(3, 15, 'advantage')
// { success: true, roll: 17, total: 20, dc: 15, margin: 5, ... }
```

### stats.js

Character stat calculations:

```javascript
import {
  getModifier,           // Attribute score -> modifier
  formatModifier,        // +3 or -1 formatting
  getProficiencyBonus,   // Level -> proficiency
  calculateMaxHP,        // HP calculation
  calculateMaxMP,        // MP for spellcasters
  calculateAC,           // Armor class calculation
  getXPForNextLevel      // XP thresholds
} from '@/lib/utils/stats'

// Examples
const strMod = getModifier(16)  // Returns 3
const display = formatModifier(strMod)  // Returns "+3"
const maxHP = calculateMaxHP('fighter', 5, 14)  // HP for level 5 fighter
```

## Design Principles

1. **Pure Functions**: No side effects, same input = same output
2. **Single Responsibility**: Each function does one thing
3. **Well Documented**: JSDoc comments for all exports
4. **Testable**: Easy to unit test in isolation

## Adding New Utilities

1. Create a new file for the utility category
2. Export only the public API
3. Add JSDoc comments
4. Update this README

## Testing Utilities

```javascript
// Example test for dice.js
import { rollNotation } from '@/lib/utils/dice'

describe('rollNotation', () => {
  it('parses 2d6+3 correctly', () => {
    const result = rollNotation('2d6+3')
    expect(result.modifier).toBe(3)
    expect(result.rolls.length).toBe(2)
    expect(result.total).toBeGreaterThanOrEqual(5)
    expect(result.total).toBeLessThanOrEqual(15)
  })
})
```
