# Frontend — React + Vite SPA

Single-page application for Truth of Abyss. Built with React 19, Vite 7, Tailwind CSS v4, and React Router DOM.

## Directory Structure

```
frontend/
├── index.html              # HTML entry point
├── vite.config.js          # Vite config (React SWC, Tailwind plugin, path aliases)
├── package.json
├── src/
│   ├── main.jsx            # React root — BrowserRouter + global CSS imports
│   ├── App.jsx             # Renders <AppRoutes />
│   ├── routes/
│   │   └── AppRoutes.jsx   # All route definitions (React Router <Routes>)
│   ├── pages/              # Route-level page components
│   ├── components/
│   │   ├── ui/             # shadcn/ui base components (Button, Card, Input, etc.)
│   │   ├── game/           # Game-specific components (sidebar, event, combat, inventory)
│   │   └── guest/          # Guest mode pages (create, play)
│   ├── lib/
│   │   ├── api.js          # HTTP client for backend REST API
│   │   ├── supabase/
│   │   │   └── client.js   # Browser Supabase client (auth only)
│   │   ├── guest-config.js # Static game data for guest mode (races, classes, events)
│   │   ├── guest-utils.js  # Dice/stat utilities for guest mode
│   │   └── game-mechanics.js # Local game calculations (dice, combat, AC)
│   └── styles/
│       ├── globals.css     # Tailwind import + theme CSS variables
│       ├── index.css       # Base font/color defaults
│       ├── HomePage.css    # Gothic theme overrides
│       └── App.css         # App-level styles
```

## Running

```bash
npm install
npm run dev      # Vite dev server on port 5173
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Environment Variables

Create a `.env.local` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3000/api
```

## Path Aliases

Configured in `vite.config.js`:

| Alias           | Maps to        |
|-----------------|----------------|
| `@`             | `./src`        |
| `@/components`  | `./src/components` |
| `@/lib`         | `./src/lib`    |
| `@/pages`       | `./src/pages`  |
| `@/styles`      | `./src/styles` |

## Key Libraries

| Package            | Purpose                    |
|--------------------|----------------------------|
| `react-router-dom` | Client-side routing        |
| `@supabase/ssr`    | Browser Supabase client    |
| `tailwindcss` + `@tailwindcss/vite` | Styling (v4) |
| `@mui/material`    | Some UI components         |
| `lucide-react`     | Icons                      |

## How It Works

1. `main.jsx` wraps `<App>` in `<BrowserRouter>` and imports global CSS
2. `App.jsx` renders `<AppRoutes>` which maps URL paths to page components
3. **Authenticated pages** use `lib/api.js` to call the backend Express API and `lib/supabase/client.js` for auth
4. **Guest pages** use `lib/guest-config.js` (static data) and `lib/guest-utils.js` (dice/stats) with `localStorage` — no backend required
