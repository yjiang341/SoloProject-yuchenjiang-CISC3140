# Lib

Shared utility modules and client libraries used across the frontend.

## Files

### `api.js` — Backend HTTP Client

Centralized `fetch` wrapper for all backend REST API calls. Every function maps to an endpoint on the Express server.

```
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
```

| Export                   | Method | Endpoint                              |
|--------------------------|--------|---------------------------------------|
| `getGameConfig()`        | GET    | `/config/game`                        |
| `createCharacter()`      | POST   | `/characters`                         |
| `getUserCharacters()`    | GET    | `/characters/:userId`                 |
| `getCharacter()`         | GET    | `/characters/:id/single`              |
| `updateCharacter()`      | PUT    | `/characters/:id`                     |
| `deleteCharacter()`      | DELETE | `/characters/:id`                     |
| `getCharacterInventory()`| GET    | `/characters/:id/inventory`           |
| `addItemToInventory()`   | POST   | `/characters/:id/inventory`           |
| `toggleEquipItem()`      | PUT    | `/characters/:id/inventory/:itemId`   |
| `removeItemFromInventory()` | DELETE | `/characters/:id/inventory/:itemId` |
| `createSave()`           | POST   | `/saves`                              |
| `getSaves()`             | GET    | `/saves/:characterId`                 |
| `getLatestSave()`        | GET    | `/saves/:characterId/latest`          |
| `updateSave()`           | PUT    | `/saves/:saveId`                      |
| `rollDice()`             | POST   | `/game/roll-dice`                     |
| `processChoice()`        | POST   | `/game/process-choice`                |
| `getGameConfigCached()`  | —      | Cached version with localStorage fallback |

### `supabase/client.js` — Browser Auth Client

Exports a singleton `supabase` instance (from `@supabase/ssr`) used **only for authentication** (login, signup, getUser). All data operations go through `api.js`.

```javascript
import { supabase } from '@/lib/supabase/client'
const { data: { user } } = await supabase.auth.getUser()
```

### `guest-config.js` — Static Game Data

Frontend-local copy of game data for guest mode (no backend needed):

- `RACES` — 9 playable races with ability bonuses
- `CLASSES` — 12 classes with hit die and spellcaster flag
- `STAT_NAMES` — 6 ability scores (key, name, abbreviation)
- `BASE_STATS` — Default stats (all 10)
- `EVENTS_DATA` — Full branching event tree (20+ events)

### `guest-utils.js` — Guest Dice/Stat Utilities

Pure functions for guest mode calculations:

| Export            | Description                                |
|-------------------|--------------------------------------------|
| `getModifier(score)` | D&D 5e modifier: `floor((score-10)/2)`  |
| `formatModifier(mod)` | Format as `"+3"` or `"-1"`             |
| `getModifierString(score)` | Combined: score → formatted modifier |
| `rollStat()`      | 4d6 drop lowest                           |
| `rollD20()`        | Random 1–20                               |
| `statCheck(mod, dc)` | d20 + modifier vs DC with crit detection |

### `game-mechanics.js` — Local Game Calculations

Used by authenticated game components for calculations that don't need the backend:

| Export                  | Description                          |
|-------------------------|--------------------------------------|
| `rollDiceLocal(notation)` | Parse and roll `"2d6+3"`           |
| `rollD20(modifier)`     | d20 + modifier                       |
| `rollInitiative(char)`  | Initiative roll                      |
| `attackRoll(char, target)` | Attack roll vs AC                 |
| `calculateDamage(char)` | Damage roll                          |
| `calculateAC(char)`     | Armor class calculation              |
| `getAbilityModifierLocal(score)` | Local modifier calculation  |
| `savingThrow(char, stat, dc)` | Saving throw check            |
| `skillCheck(char, stat, dc)` | Skill check                     |
