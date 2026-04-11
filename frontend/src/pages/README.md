# Pages

Route-level page components. Each file corresponds to a route in `AppRoutes.jsx`.

## Files

| File                    | Route                    | Auth Required | Description                          |
|-------------------------|--------------------------|---------------|--------------------------------------|
| `HomePage.jsx`          | `/`                      | No            | Landing page with login/guest links  |
| `LoginPage.jsx`         | `/auth/login`            | No            | Email/password login form            |
| `SignUpPage.jsx`        | `/auth/sign-up`          | No            | Registration form                    |
| `SignUpSuccessPage.jsx` | `/auth/sign-up-success`  | No            | Post-signup confirmation             |
| `CharacterSelectPage.jsx` | `/character`           | Yes           | List and select characters           |
| `CharaCreatePage.jsx`   | `/character/create`      | Yes           | Authenticated character creation     |
| `GamePage.jsx`          | `/game`                  | Yes           | Main game (events, combat, inventory)|
| `ErrorPage.jsx`         | `*` (catch-all)          | No            | 404 / error display                  |

## Patterns

- All pages import `supabase` from `@/lib/supabase/client` for authentication checks
- Navigation uses `useNavigate()` and `<Link>` from `react-router-dom`
- Authenticated pages redirect to `/auth/login` if no session is found
- Backend data is fetched via functions from `@/lib/api.js`

## Authentication Flow

```
LoginPage → supabase.auth.signInWithPassword() → navigate('/character')
SignUpPage → supabase.auth.signUp() → navigate('/auth/sign-up-success')
GamePage  → supabase.auth.getUser() → if no user → navigate('/auth/login')
```
