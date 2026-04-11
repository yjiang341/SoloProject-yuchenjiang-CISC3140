/**
 * D&D 5e SRD API Service
 * Fetches data from the open5e API for races, classes, equipment, spells, and monsters
 */

const API_BASE = 'https://www.dnd5eapi.co/api'

// Cache for API responses
const cache = new Map()

async function fetchWithCache(endpoint, ttl = 3600000) {
  const cacheKey = endpoint
  const cached = cache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`)
  if (!response.ok) {
    throw new Error(`D&D API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  cache.set(cacheKey, { data, timestamp: Date.now() })
  return data
}

// Races
async function getRaces() {
  const data = await fetchWithCache('/races')
  return data.results
}

async function getRace(index) {
  return await fetchWithCache(`/races/${index}`)
}

// Classes
async function getClasses() {
  const data = await fetchWithCache('/classes')
  return data.results
}

async function getClass(index) {
  return await fetchWithCache(`/classes/${index}`)
}

// Equipment
async function getEquipment() {
  const data = await fetchWithCache('/equipment')
  return data.results
}

async function getEquipmentItem(index) {
  return await fetchWithCache(`/equipment/${index}`)
}

// Weapons
async function getWeapons() {
  const data = await fetchWithCache('/equipment-categories/weapon')
  return data.equipment || []
}

// Armor
async function getArmor() {
  const data = await fetchWithCache('/equipment-categories/armor')
  return data.equipment || []
}

// Spells
async function getSpells() {
  const data = await fetchWithCache('/spells')
  return data.results
}

async function getSpell(index) {
  return await fetchWithCache(`/spells/${index}`)
}

async function getSpellsByClass(classIndex) {
  const data = await fetchWithCache(`/classes/${classIndex}/spells`)
  return data.results || []
}

// Monsters
async function getMonsters() {
  const data = await fetchWithCache('/monsters')
  return data.results
}

async function getMonster(index) {
  return await fetchWithCache(`/monsters/${index}`)
}

async function getMonstersByChallenge(rating) {
  const data = await fetchWithCache(`/monsters?challenge_rating=${rating}`)
  return data.results || []
}

// Ability Scores
async function getAbilityScores() {
  const data = await fetchWithCache('/ability-scores')
  return data.results
}

// Skills
async function getSkills() {
  const data = await fetchWithCache('/skills')
  return data.results
}

// Proficiencies
async function getProficiencies() {
  const data = await fetchWithCache('/proficiencies')
  return data.results
}

// Helper function to calculate ability modifier
function getAbilityModifier(score) {
  return Math.floor((score - 10) / 2)
}

// Helper to format modifier for display
function formatModifier(modifier) {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`
}

// Calculate proficiency bonus by level
function getProficiencyBonus(level) {
  return Math.ceil(level / 4) + 1
}

// Exports
module.exports = {
  getRaces,
  getRace,
  getClasses,
  getClass,
  getEquipment,
  getEquipmentItem,
  getWeapons,
  getArmor,
  getSpells,
  getSpell,
  getSpellsByClass,
  getMonsters,
  getMonster,
  getMonstersByChallenge,
  getAbilityScores,
  getSkills,
  getProficiencies,
  getAbilityModifier,
  formatModifier,
  getProficiencyBonus,
};
