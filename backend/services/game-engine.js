/**
 * Game Engine Service
 * Core game loop and state management for Truth of Abyss
 * 
 * This service handles:
 * - Dice rolling and stat checks
 * - Combat calculations
 * - Effect application
 * - Level progression
 * 
 * @module game-engine
 */

const { getAbilityModifier, getProficiencyBonus } = require('./dnd-api.js');
// Note: dice.js and stats.js utilities commented out for now
// import { rollNotation, statCheck as diceStatCheck } from '../utils/dice'
// import { getModifier, getProficiencyBonus as statProfBonus } from '../utils/stats'
// import { COMBAT_CONFIG, EVENT_CONFIG } from '../config/game-config'

// Roll dice (e.g., "2d6", "1d20+5")
function rollDice(diceNotation) {
  const regex = /(\d+)d(\d+)([+-]\d+)?/
  const match = diceNotation.match(regex)
  
  if (!match) {
    throw new Error(`Invalid dice notation: ${diceNotation}`)
  }
  
  const numDice = parseInt(match[1])
  const diceSides = parseInt(match[2])
  const modifier = match[3] ? parseInt(match[3]) : 0
  
  let total = 0
  const rolls = []
  
  for (let i = 0; i < numDice; i++) {
    const roll = Math.floor(Math.random() * diceSides) + 1
    rolls.push(roll)
    total += roll
  }
  
  return {
    rolls,
    modifier,
    total: total + modifier,
    notation: diceNotation,
    natural20: numDice === 1 && diceSides === 20 && rolls[0] === 20,
    natural1: numDice === 1 && diceSides === 20 && rolls[0] === 1,
  }
}

// Roll a d20
function rollD20() {
  return rollDice('1d20')
}

// Perform a stat check
function performStatCheck(character, stat, dc) {
  const statValue = character[stat] || 10
  const modifier = getAbilityModifier(statValue)
  const roll = rollD20()
  
  const totalRoll = roll.total + modifier
  const success = roll.natural20 || (!roll.natural1 && totalRoll >= dc)
  
  return {
    roll: roll.rolls[0],
    modifier,
    total: totalRoll,
    dc,
    success,
    natural20: roll.natural20,
    natural1: roll.natural1,
    statUsed: stat,
  }
}

// Calculate attack roll
function attackRoll(character, weapon = null) {
  const roll = rollD20()
  
  // Determine if using strength or dexterity
  const strMod = getAbilityModifier(character.strength)
  const dexMod = getAbilityModifier(character.dexterity)
  
  // Finesse weapons can use either
  const attackMod = weapon?.properties?.includes('finesse') 
    ? Math.max(strMod, dexMod) 
    : (weapon?.damage_type === 'ranged' ? dexMod : strMod)
  
  const profBonus = getProficiencyBonus(character.level)
  
  return {
    roll: roll.rolls[0],
    modifier: attackMod + profBonus,
    total: roll.total + attackMod + profBonus,
    natural20: roll.natural20,
    natural1: roll.natural1,
    isCrit: roll.natural20,
  }
}

// Calculate damage
function calculateDamage(character, weapon = null, isCrit = false) {
  const baseDamage = weapon?.damage || '1d4'
  const strMod = getAbilityModifier(character.strength)
  const dexMod = getAbilityModifier(character.dexterity)
  
  const damageMod = weapon?.properties?.includes('finesse')
    ? Math.max(strMod, dexMod)
    : (weapon?.damage_type === 'ranged' ? dexMod : strMod)
  
  // Roll damage dice
  let roll = rollDice(baseDamage)
  
  // Critical hit doubles dice
  if (isCrit) {
    const critRoll = rollDice(baseDamage)
    roll = {
      ...roll,
      rolls: [...roll.rolls, ...critRoll.rolls],
      total: roll.total + critRoll.total,
    }
  }
  
  return {
    rolls: roll.rolls,
    modifier: damageMod,
    total: Math.max(1, roll.total + damageMod),
    isCrit,
  }
}

// Calculate initiative
function rollInitiative(character) {
  const dexMod = getAbilityModifier(character.dexterity)
  const roll = rollD20()
  
  return {
    roll: roll.rolls[0],
    modifier: dexMod,
    total: roll.total + dexMod,
  }
}

// Calculate armor class
function calculateAC(character, equipment = []) {
  const dexMod = getAbilityModifier(character.dexterity)
  
  // Find equipped armor
  const armor = equipment.find(item => item.is_equipped && item.item_type === 'armor')
  
  if (!armor) {
    // Unarmored: 10 + DEX modifier
    return 10 + dexMod
  }
  
  const armorBase = armor.properties?.ac_base || 10
  const maxDexBonus = armor.properties?.max_dex_bonus
  
  const dexBonus = maxDexBonus !== undefined 
    ? Math.min(dexMod, maxDexBonus) 
    : dexMod
  
  return armorBase + dexBonus
}

// Apply effects from an event choice
function applyEffects(character, effects) {
  const updates = {}
  const messages = []
  
  if (effects.hp) {
    const newHp = Math.max(0, Math.min(character.max_hp, character.hp + effects.hp))
    updates.hp = newHp
    messages.push(effects.hp > 0 
      ? `Recovered ${effects.hp} HP` 
      : `Lost ${Math.abs(effects.hp)} HP`)
  }
  
  if (effects.mp) {
    const newMp = Math.max(0, Math.min(character.max_mp, character.mp + effects.mp))
    updates.mp = newMp
    messages.push(effects.mp > 0 
      ? `Gained ${effects.mp} MP` 
      : `Lost ${Math.abs(effects.mp)} MP`)
  }
  
  if (effects.gold) {
    const newGold = Math.max(0, character.gold + effects.gold)
    updates.gold = newGold
    messages.push(effects.gold > 0 
      ? `Found ${effects.gold} gold` 
      : `Lost ${Math.abs(effects.gold)} gold`)
  }
  
  if (effects.experience) {
    updates.experience = character.experience + effects.experience
    messages.push(`Gained ${effects.experience} XP`)
  }
  
  // Stat modifications
  const stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
  stats.forEach(stat => {
    if (effects[stat]) {
      updates[stat] = character[stat] + effects[stat]
      messages.push(`${stat.charAt(0).toUpperCase() + stat.slice(1)} ${effects[stat] > 0 ? 'increased' : 'decreased'} by ${Math.abs(effects[stat])}`)
    }
  })
  
  return { updates, messages }
}

// Calculate experience needed for next level
function getXPForLevel(level) {
  const xpTable = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 
                   85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000]
  return xpTable[level] || xpTable[xpTable.length - 1]
}

// Check if character should level up
function checkLevelUp(character) {
  const xpNeeded = getXPForLevel(character.level)
  return character.experience >= xpNeeded && character.level < 20
}

// Process level up
function processLevelUp(character) {
  const newLevel = character.level + 1
  const conMod = getAbilityModifier(character.constitution)
  
  // Roll for HP (or take average)
  const hpRoll = rollDice('1d8') // Using d8 as default hit die
  const hpGain = Math.max(1, hpRoll.total + conMod)
  
  return {
    level: newLevel,
    max_hp: character.max_hp + hpGain,
    hp: character.hp + hpGain, // Heal on level up
    hpGained: hpGain,
  }
}

// Exports
module.exports = {
  rollDice,
  rollD20,
  performStatCheck,
  attackRoll,
  calculateDamage,
  rollInitiative,
  calculateAC,
  applyEffects,
  getXPForLevel,
  checkLevelUp,
  processLevelUp,
};
