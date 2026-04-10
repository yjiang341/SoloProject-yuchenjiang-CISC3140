/**
 * Dice Rolling Utilities
 * Handles all dice-related operations for the game
 */

/**
 * Roll a single die
 * @param {number} sides - Number of sides on the die
 * @returns {number} The roll result
 */
export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1
}

/**
 * Roll multiple dice
 * @param {number} count - Number of dice to roll
 * @param {number} sides - Number of sides per die
 * @returns {Object} { total, rolls }
 */
export function rollMultiple(count, sides) {
  const rolls = []
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides))
  }
  return {
    total: rolls.reduce((sum, r) => sum + r, 0),
    rolls
  }
}

/**
 * Parse and roll dice notation (e.g., "2d6+3", "1d20-2")
 * @param {string} notation - Dice notation string
 * @returns {Object} { total, rolls, modifier, notation }
 */
export function rollNotation(notation) {
  const match = notation.toLowerCase().match(/^(\d+)d(\d+)([+-]\d+)?$/)
  
  if (!match) {
    console.error(`[v0] Invalid dice notation: ${notation}`)
    return { total: 0, rolls: [], modifier: 0, notation, error: 'Invalid notation' }
  }
  
  const count = parseInt(match[1], 10)
  const sides = parseInt(match[2], 10)
  const modifier = match[3] ? parseInt(match[3], 10) : 0
  
  const { total: rollTotal, rolls } = rollMultiple(count, sides)
  const total = rollTotal + modifier
  
  return { total, rolls, modifier, notation }
}

/**
 * Roll a D20 (most common roll)
 * @returns {number}
 */
export function rollD20() {
  return rollDie(20)
}

/**
 * Roll a D20 with advantage (roll twice, take higher)
 * @returns {Object} { result, rolls }
 */
export function rollWithAdvantage() {
  const roll1 = rollD20()
  const roll2 = rollD20()
  return {
    result: Math.max(roll1, roll2),
    rolls: [roll1, roll2],
    type: 'advantage'
  }
}

/**
 * Roll a D20 with disadvantage (roll twice, take lower)
 * @returns {Object} { result, rolls }
 */
export function rollWithDisadvantage() {
  const roll1 = rollD20()
  const roll2 = rollD20()
  return {
    result: Math.min(roll1, roll2),
    rolls: [roll1, roll2],
    type: 'disadvantage'
  }
}

/**
 * Perform a stat check (D20 + modifier vs DC)
 * @param {number} modifier - The stat modifier to add
 * @param {number} dc - Difficulty class to beat
 * @param {string} rollType - 'normal', 'advantage', or 'disadvantage'
 * @returns {Object} { success, roll, total, dc, margin }
 */
export function statCheck(modifier, dc, rollType = 'normal') {
  let rollResult
  
  switch (rollType) {
    case 'advantage':
      rollResult = rollWithAdvantage()
      break
    case 'disadvantage':
      rollResult = rollWithDisadvantage()
      break
    default:
      rollResult = { result: rollD20(), rolls: [rollD20()], type: 'normal' }
  }
  
  const total = rollResult.result + modifier
  const success = total >= dc
  const margin = total - dc
  
  // Check for critical success/failure
  const isCriticalSuccess = rollResult.result === 20
  const isCriticalFailure = rollResult.result === 1
  
  return {
    success,
    roll: rollResult.result,
    modifier,
    total,
    dc,
    margin,
    rollType: rollResult.type,
    allRolls: rollResult.rolls,
    isCriticalSuccess,
    isCriticalFailure
  }
}

/**
 * Roll initiative for combat
 * @param {number} dexModifier - Character's dexterity modifier
 * @returns {number} Initiative value
 */
export function rollInitiative(dexModifier) {
  return rollD20() + dexModifier
}

/**
 * Roll damage with optional critical multiplier
 * @param {string} damageNotation - Dice notation (e.g., "2d6")
 * @param {boolean} isCritical - Whether this is a critical hit
 * @returns {Object} { total, rolls, isCritical }
 */
export function rollDamage(damageNotation, isCritical = false) {
  const result = rollNotation(damageNotation)
  
  if (isCritical) {
    // On critical, roll damage dice twice
    const critResult = rollNotation(damageNotation)
    return {
      total: result.total + critResult.total - result.modifier, // Don't double modifier
      rolls: [...result.rolls, ...critResult.rolls],
      modifier: result.modifier,
      isCritical: true
    }
  }
  
  return { ...result, isCritical: false }
}
