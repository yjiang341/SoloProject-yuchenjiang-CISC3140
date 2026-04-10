# Application Routes (`/app`)

This directory contains all pages and API routes for **Truth of Abyss** using Next.js App Router.

## Directory Structure

```
app/
├── HomePage.jsx                    # Landing page / Main menu
├── layout.tsx                  # Root layout with fonts & metadata
├── globals.css                 # Global styles & theme tokens
│
├── auth/                       # Authentication pages
│   ├── login/HomePage.jsx          # Sign in
│   ├── sign-up/HomePage.jsx        # Registration
│   ├── sign-up-success/HomePage.jsx # Email confirmation notice
│   ├── callback/CallBackRoute.js       # OAuth/email callback handler
│   └── error/HomePage.jsx          # Auth error page
│
├── character/                  # Character management
│   ├── HomePage.jsx                # Character selection
│   └── create/HomePage.jsx         # Character creation wizard
│
└── game/                       # Main game
    └── HomePage.jsx                # Game interface
```

## Route Protection

The middleware (`/middleware.js`) handles route protection:
- `/game/*` and `/character/*` require authentication
- Unauthenticated users are redirected to `/auth/login`
- Authenticated users are redirected away from auth pages

## Pages Overview

### Landing Page (`/`)
- Game title and description
- Login/Register buttons for guests
- Continue/New Character for logged-in users
- Feature highlights

### Authentication (`/auth/*`)
- **Login**: Email/password sign in
- **Sign Up**: Account creation with username
- **Callback**: Handles Supabase auth redirects
- **Error**: Displays auth failures

### Character Management (`/character/*`)
- **Select**: View all characters, delete, or continue
- **Create**: 5-step wizard:
  1. Name input
  2. Race selection (9 D&D races)
  3. Class selection (12 D&D classes)
  4. Ability scores (standard array)
  5. Review and confirm

### Game (`/game`)
Main gameplay loop:
- Story events with choices
- Stat checks and dice rolls
- Turn-based combat
- Inventory management
- Auto-save every 30 seconds

## Query Parameters

### `/game`
- `character`: Character UUID (required)
- `save`: Save UUID (optional, loads specific save)

Example: `/game?character=abc-123&save=def-456`

## API Routes

Currently, all data operations use direct Supabase client calls. 
Future API routes could be added to `/app/api/` for:
- Server-side game logic
- Webhook handlers
- Public leaderboards

## Styling

The app uses a dark gothic theme defined in `globals.css`:
- Custom CSS properties for colors
- Cinzel font for headings
- Crimson Text for body
- Responsive design with mobile sidebar
