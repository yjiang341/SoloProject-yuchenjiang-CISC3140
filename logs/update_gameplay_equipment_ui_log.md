# Changelog — update/Gameplay-Equipment-UI-Logic
Date: 2026-05-09
Branch: `main`

## TL;DR

- Fixed equipment slot compatibility to follow RPG/D&D intent:
  - shield/handheld items restricted to hand slots
  - body armor restricted to body slots
  - accessories restricted to ring slot
- Added persistent slot-rule metadata (`allowed_slots`) so items keep correct compatibility even after unequip.
- Added one-time Supabase inventory repair script and ran it to normalize existing inventory rows.
- Fixed enemy turn scheduling/ref stability and improved combat modal/title UX.
- Added consumable-use flow in inventory and corrected item type classification for story rewards.
- Fixed global badge rendering issue (blank color pills) by updating shared badge wrapper.
- Improved combat stat clarity:
  - separated Hit vs Damage in UI
  - wired sidebar/combat stats to dynamic equipment-aware calculations.
- Added auto-dismiss for success (green) game messages after 3 seconds.
- Updated navbar auth UX:
  - guest shows only `Guest Quest`
  - signed-in hides `Guest Quest`
  - signed-in account area shows avatar + nickname
  - logout now hard refreshes to `/` into guest view.

# Feature Log: Equipment Rules, Stat Sync, Badge Fixes, Messaging, and Navbar Auth UX

## Summary

This chat focused on gameplay correctness and UI consistency across equipment handling, dynamic combat/stat display, badge rendering, message lifecycle, and authenticated navigation behavior.

---

## 1) Equipment Slot Logic Corrections (RPG/D&D alignment)

### Updated

- `frontend/src/components/game/equipment-panel.jsx`
  - Introduced slot-category-aware matching.
  - Added robust compatibility logic so hand-held items do not appear in body slots.
  - Added/integrated item inference for slot compatibility and normalized slot acceptance logic.

### Result

- Shield and hand-held items no longer appear as helmet/chest/legs/boots candidates.
- Slot picker behavior now aligns with expected RPG equipment semantics.

---

## 2) Persistent Slot Rules via `allowed_slots`

### Problem

Unequipping previously set `properties.slot` to `null`, causing certain items (like shield) to lose slot identity and become misclassified.

### Updated

- `frontend/src/components/game/equipment-panel.jsx`
  - Added `inferAllowedSlots(item)`.
  - Updated compatibility to prefer `allowed_slots` as intrinsic rule.
  - Preserved/stored `allowed_slots` during equip/unequip transitions.

- `frontend/src/pages/GamePage.jsx`
  - Updated story reward item builder and D&D item mapping to populate `allowed_slots` for new items.

### Result

- Items retain intrinsic legal slots after unequip.
- Shield remains hand-only across lifecycle transitions.

---

## 3) Existing Inventory Data Repair (Supabase)

### Updated

- `backend/seeds/fix-inventory-slots.js` (new)
  - One-time migration script to normalize `item_type`, `properties.slot`, and `properties.allowed_slots` for current inventory rows.
  - Added keyword and override mappings based on D&D-like item behavior.

### Executed

- Script was run during the chat to repair current rows (including shield, potion, war pick normalization at earlier stage).

### Result

- Existing DB items now match frontend compatibility logic and no longer rely on fragile fallback typing.

---

## 4) Consumable and Item-Type UX Fixes

### Updated

- `frontend/src/components/game/inventory-panel.jsx`
  - Added usable consumable flow and item effect application path.

- `frontend/src/pages/GamePage.jsx`
  - Improved story reward type inference and overrides to correctly assign consumable/armor/weapon characteristics.

### Result

- Consumables stop appearing as incorrect equipment candidates.
- Inventory supports direct use interactions with meaningful outcomes.

---

## 5) Combat Turn Stability + Skill Modal Copy

### Updated

- `frontend/src/components/game/combat-panel.jsx`
  - Stabilized enemy action timing using refs/callback approach to avoid turn desync after rerenders.

- `frontend/src/components/game/skill-point-modal.jsx`
  - Improved title/subtitle wording:
    - `Skill Point Assignment`
    - `Combat Reward`

### Result

- Enemy reliably acts on its turn.
- Reward modal context is clearer.

---

## 6) Global Badge Rendering Fix (Color block pills)

### Problem

Badges rendered as colored pills without readable text in multiple panels.

### Updated

- `frontend/src/components/ui/badge.tsx`
  - Improved label resolution:
    - supports `label` prop
    - converts string/number children
    - flattens mixed/array children to text via helper.

- `frontend/src/components/game/inventory-panel.jsx`
  - Enhanced specific badge readability (`Qty`, `Equipped:`) with explicit labels and chip sizing.

### Result

- Badge text appears correctly across inventory/equipment/event/combat/skill modal usage.

---

## 7) Dynamic Stat Wiring (Sidebar + Combat)

### Problem

Left status panel and combat display used base character fields while equipment bonuses were only shown inside equipment panel.

### Updated

- `frontend/src/lib/game-mechanics.js`
  - Added shared derivation helpers:
    - `getEquipmentBonuses`
    - `getAttackModifier`
    - `getDefenseValue`
    - `getEquippedWeaponDamage`
    - `getDamageModifier`
    - `getDamageRange`
  - Updated AC path to use derived defense helper.

- `frontend/src/components/game/game-sidebar.jsx`
  - Now shows dynamic `Hit`, `Defense`, and `DMG` formula/range based on equipped gear.

- `frontend/src/components/game/combat-panel.jsx`
  - Uses equipped weapon dice for damage instead of fixed `1d6`.
  - Uses derived attack value in display and attack roll flow.
  - Added explicit `Damage` row with formula/range.

### Result

- Sidebar/combat stats now respond to current equipment and character state.
- Hit chance and damage formula are clearer to players.

---

## 8) Green Message Auto-Dismiss (3s)

### Updated

- `frontend/src/pages/GamePage.jsx`
  - Enhanced `addMessage` pipeline with unique IDs.
  - Added timed auto-remove for `success` messages after 3000ms.
  - Added timer ref tracking and unmount cleanup.

### Result

- Success alerts no longer pile up indefinitely.

---

## 9) Navbar Auth Behavior + Avatar

### Updated

- `frontend/src/components/navigation/site-navbar.jsx`
  - Added auth-aware tab sets:
    - signed out: only `Guest Quest`
    - signed in: `Adventure`, `Characters`, `Create Hero` (no `Guest Quest`)
  - Added profile avatar rendering beside nickname.
  - Loads `username, avatar_url` from profile.

- `frontend/src/styles/SiteNavbar.css`
  - Added avatar/account pill alignment and avatar visual styles.

### Result

- Navbar now clearly communicates guest vs account mode and shows account identity visually.

---

## 10) Logout Refresh-to-Guest Behavior

### Updated

- `frontend/src/components/navigation/site-navbar.jsx`
- `frontend/src/components/game/game-sidebar.jsx`
- `frontend/src/pages/HomePage.jsx`

All logout actions now:
1. call `supabase.auth.signOut()`
2. force full redirect with `window.location.replace('/')`

### Result

- Post-logout state consistently refreshes to home and renders guest view immediately.

---

## 11) Validation Performed During Chat

- Repeated diagnostics checks (`get_errors`) on touched files after each change set.
- Multiple frontend build checks were executed throughout and remained healthy after key patches.
- Addressed incremental lint warnings introduced during edits (e.g., regex escape cleanup and effect cleanup patterns).

---

## 12) Current State

- Equipment slot behavior follows intended RPG/D&D constraints.
- Inventory and DB item metadata are aligned with slot/type logic.
- Combat and sidebar stats are dynamically derived and more readable.
- Badge rendering is fixed globally.
- Success messages auto-dismiss after 3 seconds.
- Navbar reflects auth mode correctly, includes avatar for signed-in users, and logout reliably resets UI to guest mode.
