# Truth of Abyss

**Author:** Yuchen Jiang

A text-based RPG game inspired by D&D 5e mechanics. Explore a dungeon, make choices, roll dice, and uncover the truth behind a mysterious abyss.

## Project Structure

```
├── backend/            # Express.js REST API server
│   ├── server.js       # API entry point (all routes)
│   ├── config/         # Game configuration & balance data
│   ├── services/       # Business logic (characters, saves, events, combat)
│   ├── supabase/       # Supabase database client
│   ├── seeds/          # SQL migration & seed scripts
│   └── utils/          # Pure utility functions (dice, stats)
│
├── frontend/           # React + Vite SPA
│   ├── src/
│   │   ├── components/ # UI components (shadcn/ui + game-specific)
│   │   ├── pages/      # Route-level page components
│   │   ├── routes/     # React Router configuration
│   │   ├── lib/        # API client, Supabase client, guest-mode utilities
│   │   └── styles/     # CSS (Tailwind + custom gothic theme)
│   └── index.html      # HTML entry point
```

## Tech Stack

| Layer       | Technology                                        |
|-------------|---------------------------------------------------|
| Frontend    | React 19, Vite 7, React Router DOM 7              |
| Styling     | Tailwind CSS v4, shadcn/ui components, MUI         |
| Backend     | Express.js 5, Node.js (CommonJS)                   |
| Database    | Supabase (PostgreSQL + Auth + Row Level Security)   |
| Auth        | Supabase Auth (email/password)                      |

## Architecture

The frontend and backend are fully separated:

- **Frontend** runs on Vite dev server (default port 5173) and communicates with the backend via HTTP REST calls through `src/lib/api.js`.
- **Backend** runs on Express (default port 3000) and handles all database operations, game logic, and D&D API integration.
- **Guest Mode** runs entirely in the browser with no backend needed — uses `localStorage` for persistence and local game data from `src/lib/guest-config.js`.

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (for authenticated mode)

### Backend Setup

```bash
cd backend
npm install
# Create .env with:
#   SUPABASE_URL=https://your-project.supabase.co
#   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
npm run dev    # Starts on port 3000 with nodemon
```

### Frontend Setup

```bash
cd frontend
npm install
# Create .env.local with:
#   VITE_SUPABASE_URL=https://your-project.supabase.co
#   VITE_SUPABASE_ANON_KEY=your_anon_key
#   VITE_API_URL=http://localhost:3000/api
npm run dev    # Starts on port 5173
```

### Database Setup

Run the SQL scripts in `backend/seeds/` against your Supabase project in order:

1. `001_create_tables.sql` — Creates all tables with RLS policies
2. `002_profile_trigger.sql` — Auto-creates profiles on user signup
3. `003_seed_events.sql` — Seeds story event content

## Game Modes

| Mode          | Storage    | Features                                |
|---------------|------------|-----------------------------------------|
| Authenticated | Supabase   | Cloud saves, multiple characters, full API |
| Guest         | localStorage | Single character, offline-capable, static events |

## Routes

| Path                    | Page                  | Auth Required |
|-------------------------|-----------------------|---------------|
| `/`                     | Home / Landing        | No            |
| `/auth/login`           | Login                 | No            |
| `/auth/sign-up`         | Registration          | No            |
| `/auth/sign-up-success` | Signup confirmation   | No            |
| `/character`            | Character select      | Yes           |
| `/character/create`     | Character creation    | Yes           |
| `/game`                 | Main game             | Yes           |
| `/guest/create`         | Guest character create| No            |
| `/guest/play`           | Guest game            | No            |

## API Endpoints

All endpoints are prefixed with `/api`:

| Method | Endpoint                                    | Description               |
|--------|---------------------------------------------|---------------------------|
| GET    | `/config/game`                              | Game configuration        |
| POST   | `/characters`                               | Create character          |
| GET    | `/characters/:userId`                       | List user's characters    |
| GET    | `/characters/:characterId/single`           | Get one character         |
| PUT    | `/characters/:characterId`                  | Update character          |
| DELETE | `/characters/:characterId`                  | Delete character          |
| GET    | `/characters/:characterId/inventory`        | Get inventory             |
| POST   | `/characters/:characterId/inventory`        | Add item                  |
| PUT    | `/characters/:characterId/inventory/:itemId`| Toggle equip              |
| DELETE | `/characters/:characterId/inventory/:itemId`| Remove item               |
| POST   | `/saves`                                    | Create save               |
| GET    | `/saves/:characterId`                       | List saves                |
| GET    | `/saves/:characterId/latest`                | Get latest save           |
| PUT    | `/saves/:saveId`                            | Update save               |
| GET    | `/dnd/ability-modifier/:score`              | Calculate modifier        |
| POST   | `/game/roll-dice`                           | Roll dice                 |
| POST   | `/game/process-choice`                      | Process event choice      |
