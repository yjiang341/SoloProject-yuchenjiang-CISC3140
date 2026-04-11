# Guest Mode

Guest mode lets users play without an account. All data lives in `localStorage` — no backend calls are made.

## Pages

### `create/page.jsx` — Character Creation

Route: `/guest/create`

4-step wizard: Name → Race → Class → Stats (point buy or 4d6 drop lowest). On completion, saves character and initial game state to `localStorage`, then navigates to `/guest/play`.

**Imports from:**
- `@/lib/guest-config.js` — `RACES`, `CLASSES`, `STAT_NAMES`, `BASE_STATS`
- `@/lib/guest-utils.js` — `rollStat`, `getModifier`, `getModifierString`

### `play/page.jsx` — Gameplay

Route: `/guest/play`

Loads character and game state from `localStorage`. Displays the current event with choices, processes stat checks locally, applies effects (HP, gold, items, XP), and auto-saves after each action.

**Imports from:**
- `@/lib/guest-config.js` — `EVENTS_DATA`
- `@/lib/guest-utils.js` — `rollD20`, `statCheck`, `getModifier`

## localStorage Keys

| Key                | Contents                                      |
|--------------------|-----------------------------------------------|
| `guestCharacter`   | JSON — full character object (stats, inventory, gold) |
| `guestGameState`   | JSON — `{currentEventId, eventHistory, gameTimeSeconds}` |

## Guest vs Authenticated

| Feature           | Guest               | Authenticated       |
|-------------------|---------------------|----------------------|
| Storage           | `localStorage`       | Supabase database   |
| Events source     | `EVENTS_DATA` (static) | `events` table (DB) |
| Characters        | 1                    | Multiple            |
| Cloud sync        | No                   | Yes                 |
| Backend required  | No                   | Yes                 |
