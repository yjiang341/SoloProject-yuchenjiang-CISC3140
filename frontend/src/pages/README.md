# Authentication Directory

Handles all authentication flows for Truth of Abyss.

## Routes

### /auth/login

Login page for existing users.

**Features:**
- Email/password authentication
- Error message display
- Link to sign-up page
- Redirect after successful login

**File:** `login/HomePage.jsx`

### /auth/sign-up

Registration page for new users.

**Features:**
- Email/password registration
- Username selection
- Email confirmation flow
- Link to login page

**File:** `sign-up/HomePage.jsx`

### /auth/sign-up-success

Confirmation page after registration.

**Features:**
- Success message
- Email verification instructions
- Link to login

**File:** `sign-up-success/HomePage.jsx`

### /auth/callback

OAuth/email callback handler.

**Features:**
- Exchanges auth code for session
- Sets authentication cookies
- Redirects to appropriate page

**File:** `callback/CallBackRoute.js`

### /auth/error

Error display page.

**Features:**
- Shows authentication errors
- Link back to login
- Error details (if available)

**File:** `error/HomePage.jsx`

## Authentication Flow

```
1. User visits /auth/login or /auth/sign-up
2. Submits credentials
3. Supabase validates credentials
4. On success:
   - For login: Redirect to /character
   - For sign-up: Redirect to /auth/sign-up-success
5. User confirms email (if required)
6. Session stored in cookies
7. Middleware validates session on protected routes
```

## Protected Routes

The middleware (`/middleware.js`) protects:
- `/game/*` - Requires authentication
- `/character/*` - Requires authentication

Unauthenticated users are redirected to `/auth/login`.

## Supabase Auth Configuration

Authentication uses Supabase's built-in auth system:

```javascript
// Sign up
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { username },
    emailRedirectTo: redirectUrl
  }
})

// Sign in
await supabase.auth.signInWithPassword({
  email,
  password
})

// Sign out
await supabase.auth.signOut()
```

## Error Handling

Common auth errors:

| Error | Meaning |
|-------|---------|
| `invalid_credentials` | Wrong email/password |
| `email_not_confirmed` | User hasn't verified email |
| `user_already_exists` | Email already registered |
| `weak_password` | Password doesn't meet requirements |

## Styling

Auth pages use the gothic theme:
- Dark background
- Crimson accents
- Medieval-style headings
- Card-based forms

## Testing Auth

1. Create test account via /auth/sign-up
2. Check email for confirmation (if enabled)
3. Login via /auth/login
4. Verify redirect to /character
5. Test protected routes access
