# Supabase Client Directory

Supabase client configuration for browser and server environments.

## Files

### client.js

Browser-side Supabase client (singleton pattern):

```javascript
import { createClient } from '@/lib/supabase/client'

// In client components
const supabase = createClient()
const { data, error } = await supabase
  .from('characters')
  .select('*')
```

### server.js

Server-side Supabase client with cookie handling:

```javascript
import { createClient } from '@/lib/supabase/server'

// In Server Components or API routes
export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
}
```

### middleware.js

Session management middleware:

- Refreshes auth tokens automatically
- Protects routes requiring authentication
- Redirects authenticated users from auth pages
- Handles cookie management

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Authentication Flow

```
1. User visits /auth/login
2. Submits credentials
3. Supabase validates & returns session
4. Middleware sets cookies
5. User redirected to /character
6. Protected routes check session via middleware
```

## Row Level Security (RLS)

All database queries are subject to RLS policies. The current user's ID (`auth.uid()`) is automatically available in policies.

Example policy:
```sql
CREATE POLICY "users_own_characters" ON characters
FOR ALL USING (auth.uid() = user_id);
```

## Common Patterns

### Get Current User

```javascript
// Server Component
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

// Client Component
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Protected API Route

```javascript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Continue with authenticated request
}
```

## Debugging

Check browser Network tab for Supabase requests. Look for:
- `auth/v1/token` - Auth operations
- `rest/v1/tablename` - Database queries

Common issues:
- 401 errors: Session expired, re-login required
- 403 errors: RLS policy blocking access
- Network errors: Check environment variables
