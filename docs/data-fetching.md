# Data Fetching Guidelines

This document defines the mandatory data fetching patterns for this application.

## Core Principles

### 1. Server Components Only

**CRITICAL:** ALL data fetching MUST be done in **Server Components** only.

- ✅ **DO:** Fetch data in Server Components (default in Next.js App Router)
- ❌ **DO NOT:** Fetch data in Route Handlers (`app/api/*`)
- ❌ **DO NOT:** Fetch data in Client Components (`"use client"`)

**Why Server Components?**
- Automatic data caching and revalidation
- No client-side JavaScript overhead
- Direct database access without exposing credentials
- Better security and performance
- Simpler data flow

### 2. Database Queries via Data Layer

**CRITICAL:** ALL database queries MUST go through helper functions in the `/data` directory.

```typescript
// ✅ CORRECT: Use data layer helper
import { getUserWorkouts } from '@/data/workouts'

export default async function WorkoutsPage() {
  const workouts = await getUserWorkouts()
  return <WorkoutList workouts={workouts} />
}
```

**Note:** When importing TypeScript types, ALWAYS use `import type`:
```typescript
import type { WorkoutWithRelations } from '@/data/workouts'
```

```typescript
// ❌ WRONG: Direct database query in component
import { db } from '@/db'

export default async function WorkoutsPage() {
  const workouts = await db.query.workouts.findMany() // NO!
  return <WorkoutList workouts={workouts} />
}
```

### 3. Drizzle ORM Required

**CRITICAL:** Database queries MUST use **Drizzle ORM** - raw SQL is prohibited.

```typescript
// ✅ CORRECT: Drizzle ORM query
import { db } from '@/db'
import { workouts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function getUserWorkouts(userId: string) {
  return await db.query.workouts.findMany({
    where: eq(workouts.userId, userId),
    orderBy: (workouts, { desc }) => [desc(workouts.createdAt)]
  })
}
```

```typescript
// ❌ WRONG: Raw SQL query
export async function getUserWorkouts(userId: string) {
  return await db.execute(
    `SELECT * FROM workouts WHERE user_id = ${userId}` // NO!
  )
}
```

### 4. User Data Isolation

**CRITICAL:** Users MUST ONLY access their own data - NEVER another user's data.

**Every data layer function MUST:**
1. Accept `userId` as a parameter (from Clerk auth)
2. Filter results by that `userId`
3. Never allow accessing data without user verification

```typescript
// ✅ CORRECT: User-scoped query
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { workouts } from '@/db/schema'

export async function getUserWorkouts() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  return await db.query.workouts.findMany({
    where: eq(workouts.userId, userId)
  })
}
```

```typescript
// ❌ WRONG: No user filtering
export async function getAllWorkouts() {
  return await db.query.workouts.findMany() // Exposes all users' data!
}
```

## Implementation Pattern

### Step 1: Create Data Layer Function

**Location:** `/data/<entity>.ts` (e.g., `/data/workouts.ts`, `/data/exercises.ts`)

```typescript
// /data/workouts.ts
import { auth } from '@clerk/nextjs/server'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/db'
import { workouts } from '@/db/schema'

export async function getUserWorkouts() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  return await db.query.workouts.findMany({
    where: eq(workouts.userId, userId),
    orderBy: [desc(workouts.createdAt)]
  })
}

export async function getWorkoutById(workoutId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const workout = await db.query.workouts.findFirst({
    where: eq(workouts.id, workoutId)
  })

  // Verify ownership
  if (workout?.userId !== userId) {
    throw new Error('Unauthorized')
  }

  return workout
}
```

### Step 2: Use in Server Component

```typescript
// app/workouts/page.tsx (Server Component by default)
import { getUserWorkouts } from '@/data/workouts'

export default async function WorkoutsPage() {
  const workouts = await getUserWorkouts()

  return (
    <div>
      <h1>My Workouts</h1>
      <WorkoutList workouts={workouts} />
    </div>
  )
}
```

### Step 3: Pass Data to Client Components as Props

```typescript
// app/workouts/[id]/page.tsx (Server Component)
import { getWorkoutById } from '@/data/workouts'
import { WorkoutEditor } from '@/components/workout-editor'

export default async function WorkoutPage({ params }: { params: { id: string } }) {
  const workout = await getWorkoutById(params.id)

  // Pass data to Client Component
  return <WorkoutEditor initialData={workout} />
}
```

```typescript
// components/workout-editor.tsx (Client Component)
'use client'

export function WorkoutEditor({ initialData }: { initialData: Workout }) {
  const [workout, setWorkout] = useState(initialData)
  // Handle user interactions
}
```

## Data Mutations

For mutations (create, update, delete), use **Server Actions**:

```typescript
// /data/workouts.ts
'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function createWorkout(data: WorkoutInput) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const workout = await db.insert(workouts).values({
    ...data,
    userId // Always associate with current user
  }).returning()

  revalidatePath('/workouts')
  return workout[0]
}
```

## Anti-Patterns to Avoid

### ❌ Route Handlers for Data Fetching
```typescript
// app/api/workouts/route.ts - DON'T DO THIS
export async function GET() {
  const data = await db.query.workouts.findMany()
  return Response.json(data)
}
```

### ❌ Client-Side Data Fetching
```typescript
'use client'

// DON'T DO THIS
export function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([])

  useEffect(() => {
    fetch('/api/workouts')
      .then(res => res.json())
      .then(setWorkouts)
  }, [])
}
```

### ❌ Direct Database Access in Components
```typescript
// DON'T DO THIS
import { db } from '@/db'

export default async function Page() {
  const data = await db.query.workouts.findMany()
}
```

### ❌ Missing User Authorization
```typescript
// DON'T DO THIS
export async function getWorkout(id: string) {
  // Missing auth check!
  return await db.query.workouts.findFirst({
    where: eq(workouts.id, id)
  })
}
```

## Summary

1. **Server Components** - The only place to fetch data
2. **Data Layer** - All DB queries through `/data` directory helpers
3. **Drizzle ORM** - No raw SQL allowed
4. **User Isolation** - Always filter by authenticated user ID
5. **Server Actions** - For mutations with proper authorization

Following these patterns ensures security, performance, and maintainability.
