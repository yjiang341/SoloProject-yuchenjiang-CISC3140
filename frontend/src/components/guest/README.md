# Guest Mode

This directory contains the guest gameplay experience for Truth of Abyss.

## Overview

Guest mode allows users to play the game without creating an account. All data is stored locally in the browser's localStorage.

## Pages

### `/guest/create`
Character creation page for guest users.

**Features:**
- Step-by-step character creation wizard
- Race selection with ability bonuses
- Class selection with hit dice and spellcasting info
- Point buy or dice roll stat generation
- Character summary before confirmation

**Storage:**
- `localStorage.guestCharacter` - Character data (JSON)
- `localStorage.guestGameState` - Game progress (JSON)

### `/guest/play`
Main game interface for guest users.

**Features:**
- Full event-based narrative gameplay
- Stat checks with D20 rolls
- Inventory management
- Character stats sidebar
- Auto-save on each action
- Manual save option

## Data Flow

```
[Character Create] -> localStorage.guestCharacter
                   -> localStorage.guestGameState
                   -> [Game Play]
                            |
                            v
                   [Load from localStorage]
                            |
                            v
                   [Process Events from EVENTS_DATA]
                            |
                            v
                   [Save to localStorage on actions]
```

## Key Differences from Authenticated Mode

| Feature | Guest Mode | Authenticated Mode |
|---------|------------|-------------------|
| Data Storage | localStorage | Supabase Database |
| Cloud Sync | No | Yes |
| Multiple Devices | No | Yes |
| Character Limit | 1 | Multiple |
| Events Source | Static (game-config.js) | Database (events table) |

## localStorage Schema

### guestCharacter
```json
{
  "id": "guest_1234567890",
  "name": "Hero Name",
  "race": "Human",
  "class": "Fighter",
  "level": 1,
  "experience": 0,
  "hp": 12,
  "maxHp": 12,
  "mp": 0,
  "maxMp": 0,
  "strength": 16,
  "dexterity": 14,
  "constitution": 15,
  "intelligence": 10,
  "wisdom": 12,
  "charisma": 8,
  "attack": 5,
  "defense": 12,
  "gold": 100,
  "inventory": [],
  "statusEffects": [],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### guestGameState
```json
{
  "currentEventId": "start_awakening",
  "eventHistory": [
    {
      "eventId": "previous_event",
      "choice": 0,
      "checkResult": {
        "stat": "dexterity",
        "roll": 15,
        "modifier": 2,
        "total": 17,
        "dc": 10,
        "success": true
      }
    }
  ],
  "gameTimeSeconds": 300
}
```

## Debugging

To debug guest mode issues:

1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Check `guestCharacter` and `guestGameState` keys
4. Look for console errors related to JSON parsing

Common issues:
- Corrupted localStorage data - clear and recreate
- Missing event IDs - check EVENTS_DATA in game-config.js
- Stat calculation errors - verify stats.js utility functions
