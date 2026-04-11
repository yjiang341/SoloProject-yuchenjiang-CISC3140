/**
 * Event Service
 * Handles story events, branching narratives, and choice processing
 */

const { performStatCheck, applyEffects } = require('./game-engine.js');

// Process an event choice
function processChoice(character, event, choiceIndex, previousCheckResult = null) {
  const choice = event.options[choiceIndex]
  
  if (!choice) {
    throw new Error('Invalid choice index')
  }
  
  const result = {
    choice,
    nextEventId: choice.next_event,
    checkResult: null,
    effects: null,
    messages: [],
  }
  
  // Handle stat checks
  if (choice.stat_check && !previousCheckResult) {
    const check = performStatCheck(
      character,
      choice.stat_check.stat,
      choice.stat_check.dc
    )
    result.checkResult = check
    
    if (check.natural20) {
      result.messages.push('Critical Success! Natural 20!')
    } else if (check.natural1) {
      result.messages.push('Critical Failure! Natural 1!')
    } else if (check.success) {
      result.messages.push(`${check.statUsed.toUpperCase()} check passed! (${check.total} vs DC ${check.dc})`)
    } else {
      result.messages.push(`${check.statUsed.toUpperCase()} check failed! (${check.total} vs DC ${check.dc})`)
    }
  }
  
  // Apply effects if present
  if (choice.effects) {
    const { updates, messages } = applyEffects(character, choice.effects)
    result.effects = updates
    result.messages.push(...messages)
  }
  
  return result
}

// Get filtered options based on character state and requirements
function getAvailableOptions(character, event, inventory = []) {
  return event.options.filter(option => {
    // Check requirements
    if (option.requirements) {
      // Level requirement
      if (option.requirements.min_level && character.level < option.requirements.min_level) {
        return false
      }
      
      // Stat requirements
      if (option.requirements.min_stats) {
        for (const [stat, minValue] of Object.entries(option.requirements.min_stats)) {
          if (character[stat] < minValue) {
            return false
          }
        }
      }
      
      // Item requirements
      if (option.requirements.items) {
        for (const itemId of option.requirements.items) {
          if (!inventory.some(item => item.item_id === itemId)) {
            return false
          }
        }
      }
      
      // Class requirement
      if (option.requirements.class && character.class !== option.requirements.class) {
        return false
      }
      
      // Race requirement  
      if (option.requirements.race && character.race !== option.requirements.race) {
        return false
      }
    }
    
    return true
  })
}

// Generate dynamic event text based on character
function personalizeEventText(text, character) {
  return text
    .replace(/\{name\}/g, character.name)
    .replace(/\{class\}/g, character.class)
    .replace(/\{race\}/g, character.race)
    .replace(/\{level\}/g, character.level.toString())
}

// Determine which options to show after a stat check
function getPostCheckOptions(event, checkPassed) {
  return event.options.filter(option => {
    if (option.condition === 'check_passed') {
      return checkPassed
    }
    if (option.condition === 'check_failed') {
      return !checkPassed
    }
    // Options without conditions are always shown
    return !option.condition
  })
}

// Create a combat encounter from an event
function createCombatEncounter(combatData) {
  return {
    enemyId: combatData.enemy_id,
    enemies: combatData.enemies || [{ id: combatData.enemy_id, count: 1 }],
    rewards: combatData.rewards || {},
    fleeDC: combatData.flee_dc || 12,
    canFlee: combatData.can_flee !== false,
  }
}

// Local fallback events (used if database is unavailable)
const fallbackEvents = {
  start_awakening: {
    id: 'start_awakening',
    title: 'The Awakening',
    description: 'You awaken in a cold, damp dungeon cell. The flickering torchlight casts dancing shadows on the moss-covered stone walls. Your memories are fragmented—you remember only your name and a strange symbol burned into your mind. Through the rusted bars of your cell, you see a corridor stretching into darkness. A ring of ancient keys lies just beyond your reach on the floor...',
    event_type: 'story',
    options: [
      { text: 'Try to reach the keys through the bars', next_event: 'reach_keys', stat_check: { stat: 'dexterity', dc: 10 } },
      { text: 'Call out for help', next_event: 'call_help' },
      { text: 'Examine the cell for another way out', next_event: 'examine_cell', stat_check: { stat: 'intelligence', dc: 8 } },
      { text: 'Try to break the rusty bars with brute force', next_event: 'break_bars', stat_check: { stat: 'strength', dc: 14 } },
    ],
  },
  reach_keys: {
    id: 'reach_keys',
    title: 'Desperate Grasp',
    description: 'You press yourself against the cold bars, stretching your arm as far as it will go. Your fingers brush against the cold metal of the key ring...',
    event_type: 'story',
    options: [
      { text: 'Success: Grab the keys and unlock your cell', next_event: 'escaped_cell', condition: 'check_passed' },
      { text: 'Failure: The noise attracts attention', next_event: 'guard_alerted', condition: 'check_failed' },
    ],
  },
  escaped_cell: {
    id: 'escaped_cell',
    title: 'Freedom',
    description: 'The lock clicks open, and you step into the corridor. The air is thick with the smell of decay and something else... something ancient. To your left, the corridor leads to a faint source of light. To your right, stairs descend into complete darkness.',
    event_type: 'story',
    options: [
      { text: 'Head toward the light', next_event: 'toward_light' },
      { text: 'Descend into the darkness', next_event: 'into_darkness' },
      { text: 'Search the nearby cells first', next_event: 'search_cells' },
    ],
  },
}

// Exports
module.exports = {
  processChoice,
  getAvailableOptions,
  personalizeEventText,
  getPostCheckOptions,
  createCombatEncounter,
  fallbackEvents,
};
