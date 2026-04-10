# Routing

## Protected Routes

All routes under `/dashboard` (including sub-pages) are protected and require authentication.

| Route | Protected |
|-------|-----------|
| `/dashboard` | Yes |
| `/dashboard/workout/new` | Yes |
| `/dashboard/workout/[workoutId]` | Yes |

## Route Protection via Middleware

Route protection is handled **exclusively in Next.js middleware** (`middleware.ts` at the project root). Individual pages must NOT duplicate auth redirects — middleware is the single enforcement point.

### Pattern

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
```

### Rules

- Use `createRouteMatcher` with a glob pattern to match `/dashboard` and all sub-routes
- Call `auth.protect()` to redirect unauthenticated users to the Clerk sign-in page
- The matcher config must exclude Next.js internals (`_next`) and static assets
- Do not add `auth()` redirect guards inside `page.tsx` files for dashboard routes — middleware handles it

## Adding New Protected Routes

To protect a new top-level section (e.g. `/settings`), add it to the `createRouteMatcher` array:

```ts
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/settings(.*)'])
```
