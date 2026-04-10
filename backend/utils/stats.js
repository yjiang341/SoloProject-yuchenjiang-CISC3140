/**
 * Character Stats Utilities
 * Helper functions for character stat calculations
 */

import { CHARACTER_CONFIG } from '../config/game-config'

/**
 * Calculate attribute modifier (D&D 5e formula)
 * @param {number} score - The attribute score (8-20 typically)
 * @returns {number} The modifier (-1 to +5 typically)
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

// Alias for backwards compatibility
export const getModifierString = formatModifier

/**
 * Roll a single stat using 4d6 drop lowest method
 * @returns {number} Stat value (3-18)
 */
export function rollStat() {
  const rolls = []
  for (let i = 0; i < 4; i++) {
    rolls.push(Math.floor(Math.random() * 6) + 1)
  }
  // Drop the lowest roll
  rolls.sort((a, b) => a - b)
  return rolls[1] + rolls[2] + rolls[3]
}

/**
 * Roll a complete set of stats
 * @returns {Object} Object with all six stats
 */
export function rollStatArray() {
  return {
    strength: rollStat(),
    dexterity: rollStat(),
    constitution: rollStat(),
    intelligence: rollStat(),
    wisdom: rollStat(),
    charisma: rollStat()
  }
}

/**
 * Calculate proficiency bonus based on level
 * @param {number} level - Character level (1-20)
 * @returns {number} Proficiency bonus
 */
export function getProficiencyBonus(level) {
  return Math.ceil(level / 4) + 1
}

/**
 * Calculate HP for a character based on class and constitution
 * @param {string} className - The character's class
 * @param {number} level - Character level
 * @param {number} constitution - Constitution score
 * @returns {number} Maximum HP
 */
export function calculateMaxHP(className, level, constitution) {
  const conModifier = getModifier(constitution)
  
  // Hit dice by class (D&D 5e)
  const hitDice = {
    barbarian: 12,
    fighter: 10,
    paladin: 10,
    ranger: 10,
    bard: 8,
    cleric: 8,
    druid: 8,
    monk: 8,
    rogue: 8,
    warlock: 8,
    sorcerer: 6,
    wizard: 6
  }
  
  const hitDie = hitDice[className.toLowerCase()] || 8
  
  // Level 1: max hit die + con modifier
  // Higher levels: average (half hit die + 1) + con modifier per level
  const firstLevelHP = hitDie + conModifier
  const additionalHP = (level - 1) * (Math.floor(hitDie / 2) + 1 + conModifier)
  
  return Math.max(firstLevelHP + additionalHP, level) // Minimum 1 HP per level
}

/**
 * Calculate MP for spellcasting classes
 * @param {string} className - The character's class
 * @param {number} level - Character level
 * @param {number} primaryStat - Primary spellcasting stat score
 * @returns {number} Maximum MP (0 for non-casters)
 */
export function calculateMaxMP(className, level, primaryStat) {
  const spellcasters = ['wizard', 'sorcerer', 'warlock', 'cleric', 'druid', 'bard', 'paladin', 'ranger']
  
  if (!spellcasters.includes(className.toLowerCase())) {
    return 0
  }
  
  const statModifier = getModifier(primaryStat)
  
  // Half-casters (paladin, ranger) get half MP
  const isHalfCaster = ['paladin', 'ranger'].includes(className.toLowerCase())
  const mpMultiplier = isHalfCaster ? 0.5 : 1
  
  return Math.floor((level * 5 + statModifier * 2) * mpMultiplier)
}

/**
 * Calculate base attack bonus
 * @param {number} strength - Strength score (for melee)
 * @param {number} dexterity - Dexterity score (for ranged/finesse)
 * @param {number} level - Character level
 * @param {boolean} isFinesse - Whether using a finesse weapon
 * @returns {number} Attack bonus
 */
export function calculateAttackBonus(strength, dexterity, level, isFinesse = false) {
  const statToUse = isFinesse ? Math.max(strength, dexterity) : strength
  const modifier = getModifier(statToUse)
  const proficiency = getProficiencyBonus(level)
  
  return modifier + proficiency
}

/**
 * Calculate armor class
 * @param {number} dexterity - Dexterity score
 * @param {Object} armor - Equipped armor { baseAC, maxDexBonus, type }
 * @param {boolean} hasShield - Whether a shield is equipped
 * @returns {number} Armor class
 */
export function calculateAC(dexterity, armor = null, hasShield = false) {
  const dexMod = getModifier(dexterity)
  
  // No armor: 10 + full dex modifier
  if (!armor) {
    return 10 + dexMod + (hasShield ? 2 : 0)
  }
  
  // Light armor: base AC + full dex modifier
  // Medium armor: base AC + dex modifier (max 2)
  // Heavy armor: base AC (no dex)
  let ac = armor.baseAC || 10
  
  switch (armor.type) {
    case 'light':
      ac += dexMod
      break
    case 'medium':
      ac += Math.min(dexMod, armor.maxDexBonus || 2)
      break
    case 'heavy':
      // No dex bonus
      break
    default:
      ac += dexMod
  }
  
  if (hasShield) {
    ac += 2
  }
  
  return ac
}

/**
 * Calculate XP needed for next level
 * @param {number} currentLevel - Current character level
 * @returns {number} XP required for next level
 */
export function getXPForNextLevel(currentLevel) {
  // D&D 5e XP thresholds (simplified)
  const xpThresholds = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
  ]
  
  if (currentLevel >= 20) return Infinity
  return xpThresholds[currentLevel] || (currentLevel * 1000)
}

/**
 * Check if character can level up
 * @param {number} currentXP - Current experience points
 * @param {number} currentLevel - Current level
 * @returns {boolean}
 */
export function canLevelUp(currentXP, currentLevel) {
  return currentXP >= getXPForNextLevel(currentLevel)
}

/**
 * Get all attribute names
 * @returns {string[]}
 */
export function getAttributeNames() {
  return ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
}

/**
 * Calculate saving throw bonus
 * @param {number} attributeScore - The relevant attribute score
 * @param {number} level - Character level
 * @param {boolean} isProficient - Whether proficient in this save
 * @returns {number} Saving throw bonus
 */
export function getSavingThrowBonus(attributeScore, level, isProficient) {
  const modifier = getModifier(attributeScore)
  const proficiency = isProficient ? getProficiencyBonus(level) : 0
  return modifier + proficiency
}
