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
  const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/)
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

function getEquippedItems(inventory = []) {
  return inventory.filter(item => item?.is_equipped)
}

export function getEquipmentBonuses(inventory = []) {
  return getEquippedItems(inventory).reduce((acc, item) => {
    const bonus = item?.properties?.stat_bonus || {}
    Object.entries(bonus).forEach(([key, value]) => {
      if (typeof value === 'number') {
        acc[key] = (acc[key] || 0) + value
      }
    })
    return acc
  }, {})
}

export function getAttackModifier(character, inventory = []) {
  const strengthMod = getAbilityModifierLocal(character.strength || 10)
  const baseAttack = typeof character.attack === 'number' ? character.attack : strengthMod
  const equipmentBonuses = getEquipmentBonuses(inventory)
  return baseAttack + (equipmentBonuses.attack_bonus || 0)
}

export function getDefenseValue(character, inventory = []) {
  const dexMod = getAbilityModifierLocal(character.dexterity || 10)
  const baseDefense =
    typeof character.defense === 'number'
      ? character.defense
      : typeof character.armor_class === 'number'
        ? character.armor_class
        : 10 + dexMod

  const equipmentBonuses = getEquipmentBonuses(inventory)
  return baseDefense + (equipmentBonuses.ac_bonus || 0)
}

export function getEquippedWeaponDamage(inventory = [], fallbackDamage = '1d4') {
  const equippedItems = getEquippedItems(inventory)
  const equippedWeapon =
    equippedItems.find(item => item?.properties?.slot === 'main_hand' && item?.item_type === 'weapon') ||
    equippedItems.find(item => item?.properties?.slot === 'off_hand' && item?.item_type === 'weapon') ||
    equippedItems.find(item => item?.item_type === 'weapon')

  return (
    equippedWeapon?.properties?.damage ||
    equippedWeapon?.properties?.stat_bonus?.damage ||
    fallbackDamage
  )
}

function parseDamageDice(damageDice = '1d4') {
  const match = String(damageDice).match(/^(\d+)d(\d+)([+-]\d+)?$/)
  if (!match) return null
  const count = parseInt(match[1], 10)
  const size = parseInt(match[2], 10)
  const flat = match[3] ? parseInt(match[3], 10) : 0
  return { count, size, flat }
}

export function getDamageModifier(character, inventory = []) {
  const strengthMod = getAbilityModifierLocal(character.strength || 10)
  const equipmentBonuses = getEquipmentBonuses(inventory)
  return strengthMod + (equipmentBonuses.damage_bonus || 0)
}

export function getDamageRange(character, inventory = [], damageDice = null) {
  const dice = parseDamageDice(damageDice || getEquippedWeaponDamage(inventory, '1d4'))
  const modifier = getDamageModifier(character, inventory)
  if (!dice) return null

  const minRoll = dice.count + dice.flat
  const maxRoll = (dice.count * dice.size) + dice.flat
  return {
    dice: `${dice.count}d${dice.size}${dice.flat !== 0 ? (dice.flat > 0 ? `+${dice.flat}` : `${dice.flat}`) : ''}`,
    modifier,
    min: Math.max(1, minRoll + modifier),
    max: Math.max(1, maxRoll + modifier),
  }
}

/**
 * Perform an attack roll
 * @param {object} character - Character object
 * @param {number} attackBonus - Attack bonus from weapon or ability
 * @returns {object} { total: number, roll: number, isHit: function }
 */
export function attackRoll(character, attackBonus = 0) {
  const baseAttack = typeof character.attack === 'number'
    ? character.attack
    : getAbilityModifierLocal(character.strength || 10)
  const d20 = rollD20(baseAttack + attackBonus)
  
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
  const damageMatch = damageDice.match(/^(\d+)d(\d+)([+-]\d+)?$/)
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
  return getDefenseValue(character, inventory)
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
