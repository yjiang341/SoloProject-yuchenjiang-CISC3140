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
export async function getRaces() {
  const data = await fetchWithCache('/races')
  return data.results
}

export async function getRace(index) {
  return await fetchWithCache(`/races/${index}`)
}

// Classes
export async function getClasses() {
  const data = await fetchWithCache('/classes')
  return data.results
}

export async function getClass(index) {
  return await fetchWithCache(`/classes/${index}`)
}

// Equipment
export async function getEquipment() {
  const data = await fetchWithCache('/equipment')
  return data.results
}

export async function getEquipmentItem(index) {
  return await fetchWithCache(`/equipment/${index}`)
}

// Weapons
export async function getWeapons() {
  const data = await fetchWithCache('/equipment-categories/weapon')
  return data.equipment || []
}

// Armor
export async function getArmor() {
  const data = await fetchWithCache('/equipment-categories/armor')
  return data.equipment || []
}

// Spells
export async function getSpells() {
  const data = await fetchWithCache('/spells')
  return data.results
}

export async function getSpell(index) {
  return await fetchWithCache(`/spells/${index}`)
}

export async function getSpellsByClass(classIndex) {
  const data = await fetchWithCache(`/classes/${classIndex}/spells`)
  return data.results || []
}

// Monsters
export async function getMonsters() {
  const data = await fetchWithCache('/monsters')
  return data.results
}

export async function getMonster(index) {
  return await fetchWithCache(`/monsters/${index}`)
}

export async function getMonstersByChallenge(rating) {
  const data = await fetchWithCache(`/monsters?challenge_rating=${rating}`)
  return data.results || []
}

// Ability Scores
export async function getAbilityScores() {
  const data = await fetchWithCache('/ability-scores')
  return data.results
}

// Skills
export async function getSkills() {
  const data = await fetchWithCache('/skills')
  return data.results
}

// Proficiencies
export async function getProficiencies() {
  const data = await fetchWithCache('/proficiencies')
  return data.results
}

// Helper function to calculate ability modifier
export function getAbilityModifier(score) {
  return Math.floor((score - 10) / 2)
}

// Helper to format modifier for display
export function formatModifier(modifier) {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`
}

// Calculate proficiency bonus by level
export function getProficiencyBonus(level) {
  return Math.ceil(level / 4) + 1
}
