# Frontend Components (`/components`)

This directory contains all React UI components for **Truth of Abyss**.

## Directory Structure

```
components/
├── ui/                 # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── progress.tsx
│   └── ...             # Other shadcn components
│
└── game/               # Game-specific components
    ├── game-sidebar.jsx    # Character stats sidebar
    ├── event-panel.jsx     # Story event display
    ├── combat-panel.jsx    # Combat interface
    └── inventory-panel.jsx # Bag/inventory management
```

## Game Components

### `GameSidebar`
Persistent sidebar showing:
- Character name, race, class, level
- HP/MP bars with visual progress
- Combat stats (Attack, Defense)
- Ability scores with modifiers
- Gold and experience
- Play time tracker
- Quick actions (inventory, logout)

**Props:**
```javascript
{
  character: Object,      // Character data
  inventory: Array,       // Inventory items
  gameTime: Number,       // Seconds played
  isOpen: Boolean,        // Mobile sidebar state
  onClose: Function,      // Close handler
  onViewInventory: Function // Open inventory
}
```

### `EventPanel`
Main story display showing:
- Event title and description
- Available choices as buttons
- Stat check badges (shows DC and modifier)
- Check result display (success/failure)
- Combat and condition badges

**Props:**
```javascript
{
  event: Object,          // Current event data
  options: Array,         // Available choices
  onChoice: Function,     // Choice handler
  checkResult: Object,    // Last stat check result
  character: Object       // For modifier calculations
}
```

### `CombatPanel`
Turn-based combat interface:
- Player and enemy stat blocks
- HP bars for both sides
- Combat log with color coding
- Attack and flee actions
- Victory/defeat states

**Props:**
```javascript
{
  character: Object,
  combatData: Object,     // Enemy info from event
  inventory: Array,       // For AC calculation
  onCombatEnd: Function,  // Victory/defeat handler
  onCharacterUpdate: Function // HP updates
}
```

### `InventoryPanel`
Item management:
- Grouped by item type
- Equip/unequip for weapons/armor
- Item quantities
- Drop functionality
- Item properties display

**Props:**
```javascript
{
  inventory: Array,
  character: Object,
  onInventoryUpdate: Function,
  onClose: Function
}
```

## Styling

All components use:
- Tailwind CSS for styling
- CSS custom properties from `globals.css`
- Dark gothic theme colors:
  - `--primary`: Crimson red
  - `--health`: Green HP bar
  - `--mana`: Blue MP bar
  - `--accent`: Gold for rewards
  - `--destructive`: Blood red for danger

## Usage

```jsx
import GameSidebar from '@/components/game/game-sidebar'
import EventPanel from '@/components/game/event-panel'
import CombatPanel from '@/components/game/combat-panel'
import InventoryPanel from '@/components/game/inventory-panel'

// In your game pages
<GameSidebar character={character} ... />
<EventPanel event={currentEvent} ... />
```
