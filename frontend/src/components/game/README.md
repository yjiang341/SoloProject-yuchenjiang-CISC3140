# Game Components

React components for the authenticated game interface. Used by `GamePage.jsx`.

## Components

### `game-sidebar.jsx`

Persistent sidebar showing character info, HP/MP bars, combat stats, ability scores, gold, play time, and quick actions.

Imports from `@/lib/api.js` for backend data and `@/lib/game-mechanics.js` for local calculations.

### `event-panel.jsx`

Displays the current story event: title, description, and choice buttons. Shows stat check badges (`[DEX DC 12]`) and result feedback (success/failure) after rolls.

Imports from `@/lib/api.js` to call `processChoice()`.

### `combat-panel.jsx`

Turn-based combat interface with player/enemy HP bars, attack/flee actions, combat log, and victory/defeat states.

Imports from `@/lib/game-mechanics.js` for local dice rolling, attack rolls, damage, and AC calculations.

### `inventory-panel.jsx`

Item management panel: lists items grouped by type, supports equip/unequip and drop actions.

Imports from `@/lib/api.js` for `toggleEquipItem()` and `removeItemFromInventory()`.

## Data Flow

```
GamePage.jsx
├── loads character + save from API on mount
├── passes data as props to:
│   ├── <GameSidebar character={...} />
│   ├── <EventPanel event={...} onChoice={...} />
│   ├── <CombatPanel character={...} onCombatEnd={...} />
│   └── <InventoryPanel inventory={...} />
└── handles state updates and auto-saves via API
```
