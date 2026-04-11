/**
 * Character Service
 * Handles character creation, management, and database operations
 */

const { createClient } = require('../supabase/client.js');
const { getAbilityModifier } = require('./dnd-api.js');

// Standard array for point allocation
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]

// Race bonuses from D&D 5e SRD
const RACE_BONUSES = {
  dragonborn: { strength: 2, charisma: 1 },
  dwarf: { constitution: 2 },
  elf: { dexterity: 2 },
  gnome: { intelligence: 2 },
  'half-elf': { charisma: 2 },
  halfling: { dexterity: 2 },
  'half-orc': { strength: 2, constitution: 1 },
  human: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
  tiefling: { charisma: 2, intelligence: 1 },
}

// Class starting HP and primary stats
const CLASS_INFO = {
  barbarian: { hitDie: 12, primaryStat: 'strength', savingThrows: ['strength', 'constitution'] },
  bard: { hitDie: 8, primaryStat: 'charisma', savingThrows: ['dexterity', 'charisma'] },
  cleric: { hitDie: 8, primaryStat: 'wisdom', savingThrows: ['wisdom', 'charisma'] },
  druid: { hitDie: 8, primaryStat: 'wisdom', savingThrows: ['intelligence', 'wisdom'] },
  fighter: { hitDie: 10, primaryStat: 'strength', savingThrows: ['strength', 'constitution'] },
  monk: { hitDie: 8, primaryStat: 'dexterity', savingThrows: ['strength', 'dexterity'] },
  paladin: { hitDie: 10, primaryStat: 'strength', savingThrows: ['wisdom', 'charisma'] },
  ranger: { hitDie: 10, primaryStat: 'dexterity', savingThrows: ['strength', 'dexterity'] },
  rogue: { hitDie: 8, primaryStat: 'dexterity', savingThrows: ['dexterity', 'intelligence'] },
  sorcerer: { hitDie: 6, primaryStat: 'charisma', savingThrows: ['constitution', 'charisma'] },
  warlock: { hitDie: 8, primaryStat: 'charisma', savingThrows: ['wisdom', 'charisma'] },
  wizard: { hitDie: 6, primaryStat: 'intelligence', savingThrows: ['intelligence', 'wisdom'] },
}

// Calculate starting HP
function calculateStartingHP(classIndex, constitution) {
  const classInfo = CLASS_INFO[classIndex]
  if (!classInfo) return 10
  
  const conMod = getAbilityModifier(constitution)
  return classInfo.hitDie + conMod
}

// Calculate starting MP (for spellcasters)
function calculateStartingMP(classIndex, primaryStatValue) {
  const spellcasters = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard']
  if (!spellcasters.includes(classIndex)) return 0
  
  const mod = getAbilityModifier(primaryStatValue)
  return Math.max(1, mod + 1) * 2
}

// Apply race bonuses to stats
function applyRaceBonuses(stats, raceIndex) {
  const bonuses = RACE_BONUSES[raceIndex] || {}
  const newStats = { ...stats }
  
  for (const [stat, bonus] of Object.entries(bonuses)) {
    newStats[stat] = (newStats[stat] || 10) + bonus
  }
  
  return newStats
}

// Create a new character
async function createCharacter(userId, characterData) {
  const supabase = createClient()
  
  // Apply race bonuses
  const stats = applyRaceBonuses({
    strength: characterData.strength,
    dexterity: characterData.dexterity,
    constitution: characterData.constitution,
    intelligence: characterData.intelligence,
    wisdom: characterData.wisdom,
    charisma: characterData.charisma,
  }, characterData.race)
  
  // Calculate derived stats
  const classInfo = CLASS_INFO[characterData.class]
  const maxHp = calculateStartingHP(characterData.class, stats.constitution)
  const primaryStat = classInfo?.primaryStat || 'strength'
  const maxMp = calculateStartingMP(characterData.class, stats[primaryStat])
  
  // Calculate attack and defense
  const strMod = getAbilityModifier(stats.strength)
  const dexMod = getAbilityModifier(stats.dexterity)
  const attack = Math.max(strMod, dexMod) + 2 // +2 proficiency at level 1
  const defense = 10 + dexMod // Base AC
  
  const character = {
    user_id: userId,
    name: characterData.name,
    race: characterData.race,
    class: characterData.class,
    level: 1,
    experience: 0,
    hp: maxHp,
    max_hp: maxHp,
    mp: maxMp,
    max_mp: maxMp,
    ...stats,
    attack,
    defense,
    gold: 100,
    status_effects: [],
  }
  
  const { data, error } = await supabase
    .from('characters')
    .insert(character)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Get all characters for a user
async function getUserCharacters(userId) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Get a single character
async function getCharacter(characterId) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single()
  
  if (error) throw error
  return data
}

// Update character
async function updateCharacter(characterId, updates) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('characters')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', characterId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Delete character
async function deleteCharacter(characterId) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', characterId)
  
  if (error) throw error
  return true
}

// Get character inventory
async function getCharacterInventory(characterId) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('character_id', characterId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

// Add item to inventory
async function addItemToInventory(characterId, item) {
  const supabase = createClient()
  
  // Check if item already exists (stackable)
  const { data: existing } = await supabase
    .from('inventory')
    .select('*')
    .eq('character_id', characterId)
    .eq('item_id', item.item_id)
    .single()
  
  if (existing && item.stackable !== false) {
    // Update quantity
    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity: existing.quantity + (item.quantity || 1) })
      .eq('id', existing.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  // Insert new item
  const { data, error } = await supabase
    .from('inventory')
    .insert({
      character_id: characterId,
      item_id: item.item_id,
      item_name: item.item_name,
      item_type: item.item_type,
      quantity: item.quantity || 1,
      is_equipped: false,
      properties: item.properties || {},
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Equip/unequip item
async function toggleEquipItem(inventoryId, equipped) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('inventory')
    .update({ is_equipped: equipped })
    .eq('id', inventoryId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Remove item from inventory
async function removeItemFromInventory(inventoryId, quantity = 1) {
  const supabase = createClient()
  
  const { data: item } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('id', inventoryId)
    .single()
  
  if (!item) throw new Error('Item not found')
  
  if (item.quantity <= quantity) {
    // Delete the item
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', inventoryId)
    
    if (error) throw error
    return null
  }
  
  // Reduce quantity
  const { data, error } = await supabase
    .from('inventory')
    .update({ quantity: item.quantity - quantity })
    .eq('id', inventoryId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Exports
module.exports = {
  STANDARD_ARRAY,
  RACE_BONUSES,
  CLASS_INFO,
  calculateStartingHP,
  calculateStartingMP,
  applyRaceBonuses,
  createCharacter,
  getUserCharacters,
  getCharacter,
  updateCharacter,
  deleteCharacter,
  getCharacterInventory,
  addItemToInventory,
  toggleEquipItem,
  removeItemFromInventory,
};
