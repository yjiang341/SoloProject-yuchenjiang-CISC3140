# Backend — Express REST API

The backend is a standalone Express.js server that handles all database operations, game logic, and D&D API integration.

## Directory Structure

```
backend/
├── server.js           # Express app — all API routes defined here
├── package.json        # Dependencies (express, cors, dotenv, supabase)
├── config/
│   └── game-config.js  # Game balance constants, races, classes, events data
├── services/
│   ├── character-service.js  # Character CRUD + inventory operations
│   ├── dnd-api.js            # D&D 5e SRD API client with caching
│   ├── event-service.js      # Event choice processing + stat checks
│   ├── game-engine.js        # Dice rolling, combat, effect application
│   └── save-service.js       # Game save/load operations
├── supabase/
│   └── client.js       # Server-side Supabase client (service role key)
├── seeds/
│   ├── 001_create_tables.sql   # Table creation + RLS policies
│   ├── 002_profile_trigger.sql # Auto-create profile on signup
│   └── 003_seed_events.sql     # Initial story event content
└── utils/
    ├── dice.js         # Dice rolling utilities (ES6, used by config)
    └── stats.js        # Stat calculation helpers (ES6, used by config)
```

## Running

```bash
npm install
npm run dev    # nodemon on port 3000
npm start      # production mode
```

## Environment Variables

Create a `.env` file:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3000
```

## Module System

- **Services** (`services/`, `supabase/client.js`, `server.js`) use **CommonJS** (`require` / `module.exports`)
- **Config and utils** (`config/`, `utils/`) use **ES6 modules** (`import` / `export`) — these are also consumed by the frontend's guest-mode copies

## How It Works

1. `server.js` imports all services and defines REST endpoints
2. Each service function talks to Supabase through `supabase/client.js`
3. The frontend calls these endpoints via `fetch` from `frontend/src/lib/api.js`
4. All database access is scoped through Supabase Row Level Security
