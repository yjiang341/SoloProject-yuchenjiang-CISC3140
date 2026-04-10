# Game Components Directory

React components specific to the game interface.

## Components

### game-sidebar.jsx

Main navigation sidebar showing:
- Character portrait/info
- HP/MP bars with visual indicators
- Core stats display
- Quick actions (Inventory, Save, Menu)
- Navigation links

**Props:**
```javascript
{
  character: Object,      // Character data
  gameState: Object,      // Current game state
  onSave: Function,       // Save callback
  onInventory: Function,  // Open inventory callback
  onMenu: Function        // Open menu callback
}
```

### event-panel.jsx

Displays story events and choices:
- Event title and description
- Choice buttons with requirements
- Stat check indicators
- Loading/transition states

**Props:**
```javascript
{
  event: Object,          // Current event data
  character: Object,      // For requirement checks
  onChoice: Function,     // Choice selection callback
  isLoading: Boolean      // Loading state
}
```

### combat-panel.jsx

Handles combat encounters:
- Enemy display with HP bars
- Action buttons (Attack, Defend, Use Item, Flee)
- Combat log/history
- Turn order indicator
- Dice roll animations

**Props:**
```javascript
{
  combat: Object,         // Combat state
  character: Object,      // Player character
  onAction: Function,     // Action callback
  onUseItem: Function,    // Item use callback
  combatLog: Array        // Combat history
}
```

### inventory-panel.jsx

Inventory/bag management:
- Item grid display
- Equipment slots
- Item details on hover/click
- Use/Equip/Drop actions
- Gold display

**Props:**
```javascript
{
  inventory: Array,       // Items array
  equipped: Object,       // Equipped items by slot
  gold: Number,           // Current gold
  onUseItem: Function,    // Use item callback
  onEquip: Function,      // Equip callback
  onDrop: Function        // Drop callback
}
```

## Component Patterns

### State Management

Components receive state via props from parent page. Use callbacks to communicate changes up:

```jsx
// In game/HomePage.jsx
const [gameState, setGameState] = useState(initialState)

const handleChoice = async (choiceIndex) => {
  const result = await processChoice(gameState, choiceIndex)
  setGameState(result.newState)
}

return <EventPanel event={currentEvent} onChoice={handleChoice} />
```

### Styling

All components use Tailwind CSS with the gothic theme tokens:

```jsx
// Use theme colors
<div className="bg-card text-card-foreground border-border">
  <h2 className="text-primary font-heading">Event Title</h2>
</div>

// Use custom game colors
<div className="bg-[var(--health)]">HP Bar</div>
<div className="bg-[var(--mana)]">MP Bar</div>
```

### Animations

Use CSS transitions for smooth UI:

```jsx
<div className="transition-all duration-300 ease-in-out">
  {/* Animated content */}
</div>
```

## Adding New Components

1. Create file in `/components/game/`
2. Use JSX extension for React components
3. Document props with comments
4. Export as default
5. Update this README
