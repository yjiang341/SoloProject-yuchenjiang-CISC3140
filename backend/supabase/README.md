# Supabase

Database client configuration for the Express backend.

## Files

### `client.js` (Active)

Server-side Supabase client using the **service role key** for full database access. Uses CommonJS.

```javascript
const { createClient } = require('../supabase/client.js')
const supabase = createClient()
```

All backend services use this client for database operations.

### `server.js` & `middleware.js` (Legacy — Not Used)

These are leftover files from the original Next.js architecture. They use Next.js-specific APIs (`cookies()`, `NextResponse`) and are **not imported** by the Express backend. They remain for reference but can be removed.

## Environment Variables

Required in `backend/.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> **Important:** The backend uses `SUPABASE_URL` (not `NEXT_PUBLIC_SUPABASE_URL`) and `SUPABASE_SERVICE_ROLE_KEY` (not the anon key). The service role key bypasses Row Level Security, so keep it server-side only.

## Frontend vs Backend Clients

| | Backend (`supabase/client.js`) | Frontend (`src/lib/supabase/client.js`) |
|---|---|---|
| Library | `@supabase/supabase-js` | `@supabase/ssr` |
| Key | Service role key | Anon key |
| Purpose | All data operations | Authentication only |
| RLS | Bypassed | Enforced |
