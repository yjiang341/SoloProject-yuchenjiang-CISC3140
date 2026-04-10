# Backend Services (`/lib`)

This directory contains all backend logic, services, and utilities for **Truth of Abyss**.

## Directory Structure

```
lib/
├── supabase/           # Database client configuration
│   ├── client.js       # Browser client (for client components)
│   ├── server.js       # Server client (for Server Components & API routes)
│   └── middleware.js   # Session management middleware
│
├── services/           # Game logic and business services
│   ├── dnd-api.js      # D&D 5e SRD API integration
│   ├── game-engine.js  # Core game mechanics (dice, combat, stats)
│   ├── event-service.js # Story event processing
│   ├── character-service.js # Character CRUD operations
│   └── save-service.js # Game save/load functionality
│
└── utils.ts            # Shared utility functions
```

## Services Overview

### `dnd-api.js` - D&D 5e API Integration
Fetches official D&D content from the open5e API:
- Races and race traits
- Classes and class features
- Equipment, weapons, and armor
- Spells by level and class
- Monsters by challenge rating
- Ability score calculations

### `game-engine.js` - Core Game Mechanics
Implements D&D 5e gameplay mechanics:
- Dice rolling (`rollDice("2d6+3")`)
- Stat checks with DC
- Attack rolls and damage calculation
- Initiative and AC calculation
- Level up processing
- Effect application

### `event-service.js` - Story Event System
Handles the branching narrative:
- Event choice processing
- Stat check requirements
- Conditional branching
- Event text personalization
- Combat encounter creation

### `character-service.js` - Character Management
Full character lifecycle:
- Character creation with race/class bonuses
- Inventory management
- Equipment handling
- Character CRUD operations

### `save-service.js` - Game Persistence
Save/load system:
- Auto-save functionality
- Manual saves
- Event history tracking
- Game state serialization

## Usage Examples

```javascript
// Rolling dice
import { rollDice, performStatCheck } from '@/lib/services/game-engine'

const roll = rollDice('1d20+5')
console.log(roll.total) // e.g., 15

// Stat check
const check = performStatCheck(character, 'dexterity', 12)
if (check.success) {
  // Pass the check
}

// Fetching D&D data
import { getClasses, getRaces } from '@/lib/services/dnd-api'

const classes = await getClasses()
const races = await getRaces()
```

## Database Integration

Uses Supabase for all data persistence:
- **profiles**: User accounts
- **characters**: Player characters
- **inventory**: Character items
- **game_saves**: Save states
- **events**: Story content
- **event_history**: Player choices

All tables have Row Level Security (RLS) enabled.
