# Services Directory

Backend services for Truth of Abyss. Each service handles a specific domain.

## Architecture

```
services/
├── character-service.js   # Character CRUD operations
├── dnd-api.js            # D&D 5e SRD API client
├── event-service.js      # Event system & branching logic
├── game-engine.js        # Core game loop & state management
├── save-service.js       # Game save/load operations
└── README.md
```

## Service Descriptions

### character-service.js

Manages character data and operations:

- `createCharacter(userId, characterData)` - Create new character
- `getCharacters(userId)` - List user's characters
- `getCharacterById(characterId)` - Get single character
- `updateCharacter(characterId, updates)` - Update character
- `deleteCharacter(characterId)` - Delete character
- `addToInventory(characterId, item)` - Add item
- `removeFromInventory(characterId, itemId)` - Remove item
- `equipItem(characterId, itemId)` - Equip item
- `applyStatChange(characterId, changes)` - Modify stats

### dnd-api.js

D&D 5e SRD API integration:

- `fetchClasses()` - Get all available classes
- `fetchRaces()` - Get all available races
- `fetchSpells(filters)` - Get spells with filtering
- `fetchMonsters(filters)` - Get monsters for encounters
- `fetchEquipment(category)` - Get equipment by category
- `getClassDetails(className)` - Full class information
- `getRaceDetails(raceName)` - Full race information

### event-service.js

Branching narrative event system:

- `getEvent(eventId)` - Fetch event by ID
- `processChoice(character, event, choiceIndex)` - Handle player choice
- `checkRequirements(character, requirements)` - Validate prerequisites
- `applyEffects(character, effects)` - Apply choice effects
- `getNextEvent(currentEventId, choice)` - Determine next event

### game-engine.js

Core game loop and state:

- `initializeGame(userId, characterId)` - Start game session
- `processGameTick(gameState)` - Main game loop
- `handleCombat(gameState, action)` - Combat processing
- `calculateStatCheck(character, stat, dc)` - Stat checks
- `getGameState(saveId)` - Load game state
- `updateGameState(saveId, updates)` - Update state

### save-service.js

Save/load functionality:

- `createSave(userId, characterId, saveName)` - Create new save
- `getSaves(userId)` - List user's saves
- `loadSave(saveId)` - Load save data
- `updateSave(saveId, gameState)` - Update save
- `deleteSave(saveId)` - Delete save
- `autoSave(saveId, gameState)` - Auto-save handler

## Usage Example

```javascript
// In a pages or API route
import { createCharacter } from '@/lib/services/character-service'
import { initializeGame } from '@/lib/services/game-engine'
import { createSave } from '@/lib/services/save-service'

// Create character, initialize game, create save
const character = await createCharacter(userId, characterData)
const save = await createSave(userId, character.id, 'New Adventure')
const gameState = await initializeGame(userId, character.id, save.id)
```

## Error Handling

All services return consistent error objects:

```javascript
{
  success: false,
  error: 'Error message',
  code: 'ERROR_CODE'
}
```

Or on success:

```javascript
{
  success: true,
  data: { ... }
}
```

## Debugging

Services log to console with `[v0]` prefix:

```javascript
console.log('[v0] character-service: Creating character', { userId, name })
```

Filter browser console by "[v0]" to see game logs.
