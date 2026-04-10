# Authentication Guidelines

This document defines the mandatory authentication patterns for this application. This app uses **Clerk** for all authentication.

## Core Principles

### 1. Clerk is the Only Auth Provider

**CRITICAL:** All authentication MUST use **Clerk** (`@clerk/nextjs`). Do not implement custom auth or use other providers.

- ✅ **DO:** Use Clerk components and hooks
- ❌ **DO NOT:** Build custom auth flows
- ❌ **DO NOT:** Use other auth libraries (NextAuth, Auth.js, etc.)

### 2. Wrap the App in `ClerkProvider`

The root layout (`app/layout.tsx`) MUST wrap all content with `<ClerkProvider>`:

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
```

### 3. Use Clerk UI Components for Auth Actions

Use Clerk's pre-built components — never build custom sign-in/sign-up forms.

| Component | Purpose |
|-----------|---------|
| `<SignIn />` | Full sign-in UI (used on the sign-in page) |
| `<SignUp />` | Full sign-up UI (used on the sign-up page) |
| `<SignInButton />` | Button that triggers sign-in flow |
| `<SignUpButton />` | Button that triggers sign-up flow |
| `<UserButton />` | Avatar/menu for signed-in users |
| `<SignedIn>` | Renders children only when user is signed in |
| `<SignedOut>` | Renders children only when user is signed out |

```typescript
// ✅ CORRECT: Use Clerk components
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

export function Header() {
  return (
    <header>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  )
}
```

### 4. Sign-In and Sign-Up Pages

Use Clerk's catch-all route convention for auth pages:

```
app/sign-in/[[...sign-in]]/page.tsx
app/sign-up/[[...sign-up]]/page.tsx
```

```typescript
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <SignIn />
    </div>
  )
}
```

```typescript
// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <SignUp />
    </div>
  )
}
```

### 5. Getting the Current User (Server Side)

In Server Components and data layer functions, use `auth()` from `@clerk/nextjs/server`:

```typescript
// ✅ CORRECT: Server-side auth check
import { auth } from '@clerk/nextjs/server'

export default async function ProtectedPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }
  // ...
}
```

**CRITICAL:** Always `await` the `auth()` call — it is async in Clerk v5+.

### 6. Protecting Pages with Redirects

For pages that require authentication, check `userId` and redirect if missing:

```typescript
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }
  // Render protected content
}
```

- ✅ **DO:** Redirect unauthenticated users to `/sign-in`
- ❌ **DO NOT:** Render protected content without checking `userId`

### 7. Getting the Current User (Client Side)

In Client Components, use the `useUser()` hook:

```typescript
'use client'

import { useUser } from '@clerk/nextjs'

export function ProfileCard() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return null

  return <p>{user?.fullName}</p>
}
```

- Use `isLoaded` to guard against rendering before Clerk has initialized.
- Do NOT use `auth()` in Client Components — it is server-only.

## Environment Variables

Clerk requires these variables in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

See `.env.example` for the full template. Never commit `.env.local` to source control.

## Middleware (Route Protection)

For broad route protection, configure Clerk middleware in `middleware.ts` at the project root:

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

Use middleware for app-wide protection. For page-level logic (e.g., fetching user-specific data), still call `auth()` directly in the Server Component.

## Anti-Patterns to Avoid

### ❌ Using `auth()` in a Client Component
```typescript
'use client'

// DON'T DO THIS — auth() is server-only
import { auth } from '@clerk/nextjs/server'
```

### ❌ Forgetting to await `auth()`
```typescript
// DON'T DO THIS
const { userId } = auth() // Missing await!
```

### ❌ Rendering protected content without an auth check
```typescript
// DON'T DO THIS
export default async function SecretPage() {
  return <div>Secret data</div> // No auth check!
}
```

### ❌ Passing `userId` as a prop from client to server
```typescript
// DON'T DO THIS — always read userId from auth() on the server
export default async function Page({ userId }: { userId: string }) {
  // userId from props cannot be trusted
}
```

## Summary

1. **Clerk only** — no custom auth or alternative providers
2. **`ClerkProvider`** — wraps the entire app in `app/layout.tsx`
3. **Clerk UI components** — `<SignIn>`, `<SignUp>`, `<UserButton>`, etc.
4. **`auth()` on the server** — always `await` it, always check `userId`
5. **`useUser()` on the client** — for reading user info in Client Components
6. **Redirect on missing auth** — unauthenticated users go to `/sign-in`
7. **Middleware** — for broad route protection across the app
