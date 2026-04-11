/**
 * Frontend Game Mechanics Utilities
 * Local calculations for D&D game mechanics
 * No backend API calls needed
 */

/**
 * Roll dice using notation like "1d20", "2d6+3", etc.
 * @param {string} notation - Dice notation (e.g., "1d20", "2d6+3")
 * @returns {object} { roll: number, details: string }
 */
export function rollDiceLocal(notation) {
  const match = notation.match(/^(\d+)d(\d+)([\+\-]\d+)?$/)
  if (!match) throw new Error(`Invalid dice notation: ${notation}`)
  
  const [, numDice, diceSize, modifier] = match
  const num = parseInt(numDice)
  const size = parseInt(diceSize)
  const mod = modifier ? parseInt(modifier) : 0
  
  let total = 0
  const rolls = []
  
  for (let i = 0; i < num; i++) {
    const roll = Math.floor(Math.random() * size) + 1
    rolls.push(roll)
    total += roll
  }
  
  total += mod
  
  const details = `${rolls.join('+')}${mod !== 0 ? (mod > 0 ? '+' : '') + mod : ''}`
  
  return { roll: total, details }
}

/**
 * Roll a d20 for attack/save rolls
 * @param {number} modifier - Ability modifier to add
 * @returns {object} { total: number, roll: number, modifier: number }
 */
export function rollD20(modifier = 0) {
  const roll = Math.floor(Math.random() * 20) + 1
  const total = roll + modifier
  
  return { total, roll, modifier }
}

/**
 * Roll initiative for a character
 * @param {object} character - Character object with dex modifier
 * @returns {object} { total: number, roll: number, modifier: number }
 */
export function rollInitiative(character) {
  const dexMod = getAbilityModifierLocal(character.dexterity || 10)
  return rollD20(dexMod)
}

/**
 * Perform an attack roll
 * @param {object} character - Character object
 * @param {number} attackBonus - Attack bonus from weapon or ability
 * @returns {object} { total: number, roll: number, isHit: function }
 */
export function attackRoll(character, attackBonus = 0) {
  const strMod = getAbilityModifierLocal(character.strength || 10)
  const d20 = rollD20(strMod + attackBonus)
  
  return {
    ...d20,
    isHit: (targetAC) => d20.total >= targetAC,
    isCritical: () => d20.roll === 20,
    isMiss: () => d20.roll === 1,
  }
}

/**
 * Calculate damage from an attack
 * @param {object} character - Character object
 * @param {string} damageDice - Damage dice notation (e.g., "1d6", "2d8+2")
 * @returns {object} { total: number, details: string }
 */
export function calculateDamage(character, damageDice = '1d4') {
  const strMod = getAbilityModifierLocal(character.strength || 10)
  
  // Parse damage dice notation
  const damageMatch = damageDice.match(/^(\d+)d(\d+)([\+\-]\d+)?$/)
  if (!damageMatch) return { total: 0, details: 'Invalid damage dice' }
  
  const [, numDice, diceSize] = damageMatch
  const num = parseInt(numDice)
  const size = parseInt(diceSize)
  
  let total = 0
  const rolls = []
  
  for (let i = 0; i < num; i++) {
    const roll = Math.floor(Math.random() * size) + 1
    rolls.push(roll)
    total += roll
  }
  
  // Add ability modifier to damage
  const damage = Math.max(1, total + strMod)
  const details = `${rolls.join('+')} + ${strMod} (STR) = ${damage}`
  
  return { total: damage, details, rollsOnly: total, modifier: strMod }
}

/**
 * Calculate armor class for a character
 * @param {object} character - Character with AC or armor info
 * @param {array} inventory - Character inventory items
 * @returns {number} Total AC
 */
export function calculateAC(character, inventory = []) {
  let ac = 10 // Base AC
  
  // Base armor AC from character
  if (character.armor_class) {
    ac = character.armor_class
  }
  
  // Add dexterity modifier (if no armor or light armor)
  const dexMod = getAbilityModifierLocal(character.dexterity || 10)
  ac += dexMod
  
  // Check for armor in inventory
  const armor = inventory.find(item => item.item_type === 'armor' && item.is_equipped)
  if (armor && armor.armor_bonus) {
    ac += armor.armor_bonus
  }
  
  return ac
}

/**
 * Get ability modifier from an ability score
 * @param {number} score - Ability score (3-20)
 * @returns {number} Modifier (-4 to +5)
 */
export function getAbilityModifierLocal(score) {
  return Math.floor((score - 10) / 2)
}

/**
 * Perform a saving throw
 * @param {object} character - Character object
 * @param {string} ability - Ability to save with (str, dex, con, int, wis, cha)
 * @param {number} dc - Difficulty class
 * @returns {object} { success: boolean, roll: number, total: number }
 */
export function savingThrow(character, ability = 'wisdom', dc = 10) {
  const abilityScore = character[ability.toLowerCase()] || 10
  const mod = getAbilityModifierLocal(abilityScore)
  const d20 = rollD20(mod)
  
  return {
    success: d20.total >= dc,
    roll: d20.roll,
    total: d20.total,
    dc,
    isCritical: d20.roll === 20,
    isMiss: d20.roll === 1,
  }
}

/**
 * Perform a skill check
 * @param {object} character - Character object
 * @param {string} skill - Skill name
 * @param {number} dc - Difficulty class
 * @returns {object} { success: boolean, roll: number, total: number }
 */
export function skillCheck(character, skill, dc = 10) {
  // Map skills to abilities
  const skillAbilities = {
    acrobatics: 'dexterity',
    animal_handling: 'wisdom',
    arcana: 'intelligence',
    athletics: 'strength',
    deception: 'charisma',
    history: 'intelligence',
    insight: 'wisdom',
    intimidation: 'charisma',
    investigation: 'intelligence',
    medicine: 'wisdom',
    nature: 'intelligence',
    perception: 'wisdom',
    performance: 'charisma',
    persuasion: 'charisma',
    sleight_of_hand: 'dexterity',
    stealth: 'dexterity',
    survival: 'wisdom',
  }
  
  const ability = skillAbilities[skill.toLowerCase()] || 'intelligence'
  return savingThrow(character, ability, dc)
}
