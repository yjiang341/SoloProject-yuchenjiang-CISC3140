# Changelog — update/AuthNav-Profile-UI
Date: 2026-05-07
Branch: `main`

## TL;DR

- Added a global sticky top navigation component across the app with D&D-themed styling.
- Implemented auth-aware nav behavior:
	- `Log in` when signed out
	- account name + `Log out` when signed in
- Added a new user profile page with account management features:
	- nickname update
	- email update
	- password update
	- avatar upload
- Added Supabase SQL migration for profile/avatar persistence:
	- ensured profile columns and policies
	- configured `avatars` storage bucket + access policies
- Re-themed shared button system to a consistent D&D-style visual language.
- Applied the new profile-style atmospheric background globally across pages.
- Removed game-page pop-up sidebar behavior that overlaid character status panel.
- Fixed character selection card header rendering so character name, race, and class reliably display.
- Verified repeatedly with diagnostics/build checks after each milestone edit.

# Feature Log: Navigation, Profile, Theme, and Character Select Fixes

## Summary

This chat focused on system-wide UX and visual consistency improvements for the RPG frontend, auth-aware navigation behavior, profile/account management with Supabase persistence, and multiple game/character page rendering fixes.

---

## 1) Global Sticky Navbar + D&D Theme

### Updated

- `frontend/src/components/navigation/site-navbar.jsx` (new)
	- Added a reusable sticky navbar with:
		- left-aligned `TruthOfAbyss` title (home link)
		- D&D-relevant navigation tabs
		- right-side auth action button

- `frontend/src/styles/SiteNavbar.css` (new)
	- Added typography, spacing, active/hover states, and sticky behavior.

- `frontend/src/App.jsx`
	- Mounted navbar once at app shell level so it appears on all routes.

### Result

- A single, consistent top navigation experience across existing pages.

---

## 2) Auth-Aware Navbar State + Account Name Display

### Updated

- `frontend/src/components/navigation/site-navbar.jsx`
	- Wired Supabase auth state listeners.
	- Added signed-in state behavior:
		- shows account name/nickname (clickable)
		- shows `Log out` button
	- Added signed-out state behavior:
		- shows `Log in` button

- `frontend/src/styles/SiteNavbar.css`
	- Added account-pill styling and auth action-group styles.

### Result

- Navbar now reflects login status and clearly indicates the active account.

---

## 3) New User Profile Page (Nickname / Email / Password / Avatar)

### Updated

- `frontend/src/pages/userProfile.jsx` (new)
	- Added authenticated profile screen and redirect-to-login protection.
	- Implemented profile data load and display.
	- Implemented:
		- nickname save to `profiles`
		- email update via Supabase Auth
		- password update via Supabase Auth
		- avatar upload to Supabase Storage + `profiles.avatar_url` persistence

- `frontend/src/styles/UserProfile.css` (new)
	- Added full page styling and responsive layout matching requested visual direction.

- `frontend/src/routes/AppRoutes.jsx`
	- Added route: `/user/profile`.

### Result

- Users can manage account profile data and avatar in-app.

---

## 4) Supabase Profile/Avatar Schema + Policy Migration

### Updated

- `backend/seeds/004_user_profile_avatar.sql` (new)
	- Ensured `public.profiles` contains required fields, including `avatar_url`.
	- Ensured profile RLS policies exist (idempotent checks).
	- Created/updated `avatars` storage bucket (public, 2MB, image MIME whitelist).
	- Added storage object policies scoped to each authenticated user folder.

- `backend/seeds/README.md`
	- Documented the new migration and its purpose.

### Result

- Backend schema/storage setup supports profile and avatar features safely.

---

## 5) Shared Button System Redesign (D&D Style)

### Updated

- `frontend/src/components/ui/button.tsx`
	- Restyled shared button component with fantasy typography, gradients, borders, and tactile hover/active motion.
	- Implemented variant-aware styling for contained, destructive, outline, and ghost/text styles.
	- Fixed MUI typing compatibility during implementation.

- `frontend/src/styles/globals.css`
	- Added global button typography and radius consistency for MUI/native button roots.

### Result

- Most app buttons now share a cohesive D&D-themed design language.

---

## 6) Global Background Unification

### Updated

- `frontend/src/styles/globals.css`
	- Added shared atmospheric background token based on profile page backdrop.
	- Applied that background to global body and major page wrapper classes.

### Result

- Visual atmosphere is now consistent across major app pages.

---

## 7) Game Sidebar Overlay Removal (Character Panel Obstruction Fix)

### Problem

The pop-up/sidebar toggle behavior on game view could overlap and obstruct status content.

### Updated

- `frontend/src/pages/GamePage.jsx`
	- Removed mobile toggle button state and overlay-trigger logic.

- `frontend/src/components/game/game-sidebar.jsx`
	- Removed backdrop/slide-in transform behavior.
	- Kept a persistent fixed sidebar.

- `frontend/src/styles/GamePage.css`
	- Updated layout spacing for permanent sidebar.

### Result

- Sidebar no longer pops over content; status panel remains unobstructed.

---

## 8) Character Selection Header Rendering Fix (Name/Race/Class Visibility)

### Problem

Character name/race/class still failed to display in some cards.

### Updated

- `frontend/src/pages/CharacterSelectPage.jsx`
	- Replaced problematic card header composition with a standard container block.
	- Added fallback formatting for display values.

- `frontend/src/styles/CharacterSelectPage.css`
	- Added explicit header/name/meta classes for reliable spacing and visibility.

### Result

- Character name appears correctly.
- Race and class render directly beneath the name as requested.

---

## 9) Validation Performed During Chat

- Repeated diagnostics checks on modified JSX/TSX/CSS files after each major change.
- Frontend build checks were run multiple times and remained healthy after fixes.
- No outstanding diagnostics were reported in the final touched UI files.

---

## 10) Current State

- Navigation is sticky, auth-aware, and account-contextual.
- Profile/account management page is available and wired to Supabase.
- Supabase migration for profile/avatar data handling is added and documented.
- Visual style is more consistent across buttons and backgrounds.
- Game sidebar overlay issue is removed.
- Character select cards now reliably show name + race/class metadata.
