/**
 * Guest Mode Utility Functions
 * Dice rolling and stat calculations for guest mode (no backend needed)
 */

/**
 * Calculate ability modifier (D&D 5e formula)
 * @param {number} score - The ability score
 * @returns {number} The modifier
 */
export function getModifier(score) {
  return Math.floor((score - 10) / 2)
}

/**
 * Format modifier for display (+X or -X)
 * @param {number} modifier - The modifier value
 * @returns {string} Formatted string
 */
export function formatModifier(modifier) {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`
}

export const getModifierString = (score) => formatModifier(getModifier(score))

/**
 * Roll a single stat using 4d6 drop lowest
 * @returns {number} Stat value (3-18)
 */
export function rollStat() {
  const rolls = []
  for (let i = 0; i < 4; i++) {
    rolls.push(Math.floor(Math.random() * 6) + 1)
  }
  rolls.sort((a, b) => a - b)
  return rolls[1] + rolls[2] + rolls[3]
}

/**
 * Roll a d20
 * @returns {number} Result (1-20)
 */
export function rollD20() {
  return Math.floor(Math.random() * 20) + 1
}

/**
 * Perform a stat check (d20 + modifier vs DC)
 * @param {number} modifier - The stat modifier to add
 * @param {number} dc - Difficulty class to beat
 * @returns {object} { success, roll, total, dc, margin }
 */
export function statCheck(modifier, dc) {
  const roll = rollD20()
  const total = roll + modifier
  const success = total >= dc

  return {
    success,
    roll,
    modifier,
    total,
    dc,
    margin: total - dc,
    isCriticalSuccess: roll === 20,
    isCriticalFailure: roll === 1
  }
}
