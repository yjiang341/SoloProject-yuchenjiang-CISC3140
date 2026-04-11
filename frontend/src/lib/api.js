/**
 * Frontend API Client
 * Centralized HTTP client for backend API communication
 * Replaces direct imports from backend services
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  }

  try {
    const response = await fetch(url, defaultOptions)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `API error: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

// ============================================================================
// GAME CONFIG
// ============================================================================

/**
 * Get game configuration (STANDARD_ARRAY, RACE_BONUSES, CLASS_INFO)
 */
export async function getGameConfig() {
  return fetchAPI('/config/game')
}

// ============================================================================
// CHARACTER OPERATIONS
// ============================================================================

/**
 * Create a new character
 */
export async function createCharacter(userId, characterData) {
  return fetchAPI('/characters', {
    method: 'POST',
    body: JSON.stringify({ userId, character: characterData }),
  })
}

/**
 * Get all characters for a user
 */
export async function getUserCharacters(userId) {
  return fetchAPI(`/characters/${userId}`)
}

/**
 * Get a single character by ID
 */
export async function getCharacter(characterId) {
  return fetchAPI(`/characters/${characterId}/single`)
}

/**
 * Update a character
 */
export async function updateCharacter(characterId, updates) {
  return fetchAPI(`/characters/${characterId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

/**
 * Delete a character
 */
export async function deleteCharacter(characterId) {
  return fetchAPI(`/characters/${characterId}`, {
    method: 'DELETE',
  })
}

// ============================================================================
// INVENTORY OPERATIONS
// ============================================================================

/**
 * Get character inventory
 */
export async function getCharacterInventory(characterId) {
  return fetchAPI(`/characters/${characterId}/inventory`)
}

/**
 * Add item to inventory
 */
export async function addItemToInventory(characterId, item) {
  return fetchAPI(`/characters/${characterId}/inventory`, {
    method: 'POST',
    body: JSON.stringify(item),
  })
}

/**
 * Toggle equip status of an inventory item
 */
export async function toggleEquipItem(characterId, itemId, is_equipped) {
  return fetchAPI(`/characters/${characterId}/inventory/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ is_equipped }),
  })
}

/**
 * Remove item from inventory
 */
export async function removeItemFromInventory(characterId, itemId) {
  return fetchAPI(`/characters/${characterId}/inventory/${itemId}`, {
    method: 'DELETE',
  })
}

// ============================================================================
// GAME SAVES
// ============================================================================

/**
 * Create a new game save
 */
export async function createSave(userId, characterId, saveName, gameState) {
  return fetchAPI('/saves', {
    method: 'POST',
    body: JSON.stringify({ userId, characterId, saveName, gameState }),
  })
}

/**
 * Get all saves for a character
 */
export async function getSaves(characterId) {
  return fetchAPI(`/saves/${characterId}`)
}

/**
 * Get latest save for a character
 */
export async function getLatestSave(characterId) {
  return fetchAPI(`/saves/${characterId}/latest`)
}

/**
 * Update a game save
 */
export async function updateSave(saveId, updates) {
  return fetchAPI(`/saves/${saveId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

// ============================================================================
// GAME MECHANICS
// ============================================================================

/**
 * Get ability modifier from score
 */
export async function getAbilityModifier(score) {
  const response = await fetchAPI(`/dnd/ability-modifier/${score}`)
  return response.modifier
}

/**
 * Format modifier for display (e.g., "+2" or "-1")
 */
export async function formatModifier(modifier) {
  const response = await fetchAPI(`/dnd/format-modifier/${modifier}`)
  return response.formatted
}

/**
 * Roll dice with notation (e.g., "1d20+5")
 */
export async function rollDice(diceNotation) {
  return fetchAPI('/game/roll-dice', {
    method: 'POST',
    body: JSON.stringify({ diceNotation }),
  })
}

/**
 * Process an event choice with stat checks and effects
 */
export async function processChoice(character, event, choiceIndex, previousCheckResult = null) {
  return fetchAPI('/game/process-choice', {
    method: 'POST',
    body: JSON.stringify({ character, event, choiceIndex, previousCheckResult }),
  })
}

// ============================================================================
// CACHED GAME CONFIG (for offline use)
// ============================================================================

let cachedGameConfig = null

/**
 * Get game config with local caching fallback
 */
export async function getGameConfigCached() {
  if (cachedGameConfig) {
    return cachedGameConfig
  }
  
  try {
    cachedGameConfig = await getGameConfig()
    // Cache in localStorage for offline access
    localStorage.setItem('gameConfig', JSON.stringify(cachedGameConfig))
    return cachedGameConfig
  } catch (error) {
    // Try to use cached version from localStorage
    const cached = localStorage.getItem('gameConfig')
    if (cached) {
      cachedGameConfig = JSON.parse(cached)
      console.warn('Using cached game config due to API error')
      return cachedGameConfig
    }
    throw error
  }
}

/**
 * Clear cached game config
 */
export function clearGameConfigCache() {
  cachedGameConfig = null
  localStorage.removeItem('gameConfig')
}
