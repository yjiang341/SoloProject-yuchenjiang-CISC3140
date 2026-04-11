# Config

Central game configuration and static data.

## `game-config.js`

Uses ES6 `export` syntax. Contains both configuration constants and static game data used by backend services and (via copies) by the frontend guest mode.

### Configuration Objects

| Export              | Purpose                                              |
|---------------------|------------------------------------------------------|
| `CHARACTER_CONFIG`  | Attribute ranges, level progression, starting resources |
| `COMBAT_CONFIG`     | Dice types, critical hit/fumble thresholds            |
| `DND_API_CONFIG`    | D&D 5e API base URL and cache TTL                     |
| `EVENT_CONFIG`      | Event types, DC presets, starting event ID             |
| `UI_CONFIG`         | Animation durations, auto-save interval                |

### Static Game Data

| Export             | Purpose                                     |
|--------------------|---------------------------------------------|
| `RACES`            | 9 playable races with ability bonuses       |
| `CLASSES`          | 12 classes with hit die, spellcaster flag   |
| `STAT_NAMES`       | 6 ability scores with key/name/abbreviation |
| `BASE_STATS`       | Default stat values (all 10)                |
| `EVENTS_DATA`      | Full branching story event tree for guest mode |

### Helper Functions

| Export                  | Purpose                         |
|-------------------------|---------------------------------|
| `calculateModifier(score)` | D&D 5e ability modifier      |
| `calculateXPForLevel(level)` | XP needed to level up      |
| `rollDice(notation)`    | Parse and roll `"2d6+3"` style  |
| `rollD20()`             | Quick d20 roll                  |

### Game Balance

To adjust balance, edit the config objects. No code changes needed elsewhere:

| Setting             | Location                       | Default |
|---------------------|--------------------------------|---------|
| Starting Gold       | `CHARACTER_CONFIG.STARTING.GOLD` | 100   |
| Max Level           | `CHARACTER_CONFIG.LEVELS.MAX_LEVEL` | 20  |
| Point Buy Total     | `CHARACTER_CONFIG.ATTRIBUTES.POINT_BUY_TOTAL` | 27 |
| Critical Multiplier | `COMBAT_CONFIG.CRITICAL.MULTIPLIER` | 2   |
