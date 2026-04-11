# Services

Game logic and database operations. All services use **CommonJS** (`require`/`module.exports`) and are imported by `server.js`.

## Files

### `character-service.js`

Character CRUD and inventory management via Supabase.

| Export                    | Description                              |
|---------------------------|------------------------------------------|
| `STANDARD_ARRAY`          | Default stat array `[15,14,13,12,10,8]`  |
| `RACE_BONUSES`            | Stat bonuses per race                    |
| `CLASS_INFO`              | Hit die, primary stat, saving throws     |
| `createCharacter(userId, data)` | Insert new character              |
| `getUserCharacters(userId)`     | List user's characters            |
| `getCharacter(characterId)`     | Get single character              |
| `updateCharacter(id, updates)`  | Update character fields           |
| `deleteCharacter(id)`           | Delete character                  |
| `getCharacterInventory(id)`     | Get inventory items               |
| `addItemToInventory(id, item)`  | Add item                          |
| `toggleEquipItem(itemId, equipped)` | Toggle equip status          |
| `removeItemFromInventory(itemId)`   | Remove item                  |

### `dnd-api.js`

Fetches D&D 5e SRD data from `https://www.dnd5eapi.co/api` with in-memory caching (1 hour TTL).

| Export                     | Description                       |
|----------------------------|-----------------------------------|
| `getRaces()`               | List all races                    |
| `getClasses()`             | List all classes                  |
| `getRaceDetails(name)`     | Full race info                    |
| `getClassDetails(name)`    | Full class info                   |
| `getAbilityModifier(score)`| D&D 5e modifier formula           |
| `formatModifier(mod)`      | Format as `+X` / `-X`            |
| `getProficiencyBonus(level)` | Proficiency by level            |

### `event-service.js`

Processes story event choices, applies stat checks, and determines outcomes.

| Export                     | Description                                |
|----------------------------|--------------------------------------------|
| `processChoice(char, event, index, prevCheck)` | Process a player choice |

Handles: stat check rolls, success/failure branching, effect application, combat triggers.

### `game-engine.js`

Core game mechanics: dice rolling, stat checks, combat.

| Export                     | Description                            |
|----------------------------|----------------------------------------|
| `rollDice(notation)`       | Roll dice like `"2d6+3"`              |
| `performStatCheck(char, stat, dc)` | Roll d20 + modifier vs DC    |
| `applyEffects(char, effects)`      | Apply HP/MP/gold/stat changes |

### `save-service.js`

Game save/load operations via Supabase.

| Export                      | Description                           |
|-----------------------------|---------------------------------------|
| `createSave(userId, charId, name, state)` | Create new save        |
| `getSaves(characterId)`     | List saves for character              |
| `getLatestSave(characterId)`| Get most recent save                  |
| `updateSave(saveId, updates)`| Update existing save                 |

## Data Flow

```
Frontend (api.js) → HTTP request → server.js → service function → Supabase → response
```
