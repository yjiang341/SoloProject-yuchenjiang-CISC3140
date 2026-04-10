# Configuration Directory

This directory contains all configuration files for the Truth of Abyss game.

## Files

### game-config.js

Central configuration file containing:

- **CHARACTER_CONFIG**: Character creation settings
  - Attribute ranges (min, max, default)
  - Level progression settings
  - Starting resources (gold, HP, MP)

- **COMBAT_CONFIG**: Combat system settings
  - Dice configurations (D4, D6, D8, etc.)
  - Critical hit thresholds and multipliers
  - Fumble thresholds

- **DND_API_CONFIG**: D&D 5e SRD API settings
  - Base URL and endpoints
  - Cache duration settings

- **EVENT_CONFIG**: Event system settings
  - Event types (story, combat, shop, etc.)
  - Difficulty class presets
  - Starting event ID

- **UI_CONFIG**: UI behavior settings
  - Animation durations
  - Auto-save intervals
  - Toast notification settings

## Usage

```javascript
import { 
  CHARACTER_CONFIG, 
  COMBAT_CONFIG, 
  calculateModifier 
} from '@/lib/config/game-config'

// Use configuration values
const maxLevel = CHARACTER_CONFIG.LEVELS.MAX_LEVEL

// Use helper functions
const strModifier = calculateModifier(16) // Returns +3
```

## Modifying Game Balance

To adjust game balance:

1. Edit the relevant configuration object
2. Test changes in development
3. No code changes required in other files

### Common Adjustments

| Setting | Location | Default |
|---------|----------|---------|
| Starting Gold | CHARACTER_CONFIG.STARTING.GOLD | 100 |
| Max Level | CHARACTER_CONFIG.LEVELS.MAX_LEVEL | 20 |
| Critical Multiplier | COMBAT_CONFIG.CRITICAL.MULTIPLIER | 2 |
| Auto-save Interval | UI_CONFIG.AUTO_SAVE_INTERVAL | 60000ms |
