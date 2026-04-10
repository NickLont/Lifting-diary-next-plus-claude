# Data Mutation Guidelines

This document defines the mandatory patterns for creating, updating, and deleting data in this application.

## Core Principles

### 1. Mutations Are Triggered by Server Actions in Colocated `actions.ts` Files

**CRITICAL:** ALL mutations MUST be triggered via **Server Actions** defined in a colocated `actions.ts` file next to the route that uses them. Never call data layer helpers directly from components or other files.

```
app/
  dashboard/
    page.tsx
    actions.ts   ← Server Actions for this route
  workouts/
    [id]/
      page.tsx
      actions.ts ← Server Actions for this route
```

- ✅ **DO:** Define Server Actions in `actions.ts` colocated with the route
- ❌ **DO NOT:** Define Server Actions inside component files
- ❌ **DO NOT:** Call `/data` helpers directly from Client Components

### 2. Server Action Parameters Must Be Typed and Validated with Zod

**CRITICAL:** Server Action parameters MUST:
1. Use explicit TypeScript types — never `FormData` or `any`
2. Be validated with **Zod** at the top of the action before any other logic

```typescript
// ✅ CORRECT: Typed params, Zod validation
import { z } from 'zod'

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(255),
  workoutDate: z.date(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']),
})

export async function createWorkoutAction(input: z.infer<typeof createWorkoutSchema>) {
  const parsed = createWorkoutSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  await createWorkout(parsed.data)
  revalidatePath('/dashboard')
}
```

```typescript
// ❌ WRONG: FormData param, no validation
export async function createWorkoutAction(formData: FormData) {
  const name = formData.get('name') as string // Untyped, unvalidated
  await createWorkout({ name })
}
```

**Rules:**
- ✅ Params are typed as a plain object (or primitive) with explicit TypeScript types
- ✅ Use `z.infer<typeof schema>` as the param type so schema and type stay in sync
- ✅ Call `safeParse` (or `parse`) as the first thing in the action body
- ❌ Never use `FormData` as a parameter type
- ❌ Never pass raw input to a `/data` helper without parsing it first

### 4. All Mutations Go Through the Data Layer

**CRITICAL:** ALL database mutations (insert, update, delete) MUST be implemented as helper functions in the `/data` directory. Server Actions call these helpers — they do not contain Drizzle ORM logic themselves.

- ✅ **DO:** Call a helper from `/data/<entity>.ts` inside a Server Action
- ❌ **DO NOT:** Call `db.insert()`, `db.update()`, or `db.delete()` outside of `/data`

### 5. Use Drizzle ORM — No Raw SQL

**CRITICAL:** All mutations MUST use Drizzle ORM. Raw SQL is prohibited.

```typescript
// ✅ CORRECT: Drizzle ORM insert
import { db } from '@/app/index'
import { workoutsTable } from '@/app/db/schema'

await db.insert(workoutsTable).values({ ... })
```

```typescript
// ❌ WRONG: Raw SQL
await db.execute(`INSERT INTO workouts VALUES (...)`)
```

### 6. Always Authenticate Before Mutating

**CRITICAL:** Every mutation helper MUST verify the current user via `auth()` before touching the database. Never trust user-supplied IDs.

```typescript
import { auth } from '@clerk/nextjs/server'

export async function createWorkout(input: CreateWorkoutInput) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  // ...
}
```

### 7. Always Verify Ownership Before Update or Delete

**CRITICAL:** Before updating or deleting a record, confirm it belongs to the currently authenticated user. Fetch the record first and compare `userId`.

```typescript
export async function deleteWorkout(workoutId: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  // Verify ownership before deleting
  const existing = await db.query.workoutsTable.findFirst({
    where: eq(workoutsTable.id, workoutId),
  })
  if (!existing || existing.userId !== userId) {
    throw new Error('Unauthorized')
  }

  await db.delete(workoutsTable).where(eq(workoutsTable.id, workoutId))
}
```

### 8. Never Accept `userId` as Input

**CRITICAL:** `userId` MUST always come from `auth()` on the server — never from function arguments, form data, or request bodies. Accepting it as input allows callers to impersonate other users.

```typescript
// ✅ CORRECT: userId from auth()
export async function createWorkout(input: CreateWorkoutInput) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  await db.insert(workoutsTable).values({ ...input, userId })
}
```

```typescript
// ❌ WRONG: userId from caller
export async function createWorkout(userId: string, input: CreateWorkoutInput) {
  await db.insert(workoutsTable).values({ ...input, userId }) // Untrusted!
}
```

---

## File Organisation

### Data Layer (`/data`)

Mutation helpers live alongside query helpers in the same entity file:

```
/data
  workouts.ts     ← queries + mutations for workouts
  exercises.ts    ← queries + mutations for exercises
```

Keep queries and mutations for the same entity in one file to avoid duplication and make ownership checks easier to co-locate.

### Server Actions (`actions.ts`)

Server Actions MUST live in a file named `actions.ts` colocated with the route that uses them:

```
app/
  dashboard/
    page.tsx
    actions.ts        ← 'use server' — calls /data helpers, revalidates cache
  workouts/
    new/
      page.tsx
      actions.ts
    [id]/
      edit/
        page.tsx
        actions.ts
```

- One `actions.ts` per route segment that has mutations
- Each `actions.ts` MUST start with `'use server'`
- `actions.ts` files only import from `/data` — never from `@/app/index` (db) or `@/app/db/schema` directly

---

## Implementation Patterns

### Insert

```typescript
// /data/workouts.ts
import { auth } from '@clerk/nextjs/server'
import { db } from '@/app/index'
import { workoutsTable } from '@/app/db/schema'
import type { InsertWorkout } from '@/app/db/schema'

type CreateWorkoutInput = Omit<InsertWorkout, 'userId' | 'id' | 'createdAt' | 'updatedAt'>

export async function createWorkout(input: CreateWorkoutInput) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const [workout] = await db
    .insert(workoutsTable)
    .values({ ...input, userId })
    .returning()

  return workout
}
```

### Update

```typescript
// /data/workouts.ts
import { eq } from 'drizzle-orm'

export async function updateWorkout(workoutId: number, input: Partial<UpdateWorkoutInput>) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  // Verify ownership
  const existing = await db.query.workoutsTable.findFirst({
    where: eq(workoutsTable.id, workoutId),
  })
  if (!existing || existing.userId !== userId) {
    throw new Error('Unauthorized')
  }

  const [updated] = await db
    .update(workoutsTable)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(workoutsTable.id, workoutId))
    .returning()

  return updated
}
```

### Delete

```typescript
// /data/workouts.ts
export async function deleteWorkout(workoutId: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  // Verify ownership
  const existing = await db.query.workoutsTable.findFirst({
    where: eq(workoutsTable.id, workoutId),
  })
  if (!existing || existing.userId !== userId) {
    throw new Error('Unauthorized')
  }

  await db.delete(workoutsTable).where(eq(workoutsTable.id, workoutId))
}
```

---

## Server Actions Pattern

Server Actions are the only entry point for mutations. They live in colocated `actions.ts` files, validate input with Zod, call `/data` helpers, and revalidate the cache.

```typescript
// app/dashboard/actions.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createWorkout, deleteWorkout } from '@/data/workouts'

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(255),
  workoutDate: z.date(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']),
})

export async function createWorkoutAction(input: z.infer<typeof createWorkoutSchema>) {
  const parsed = createWorkoutSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  await createWorkout(parsed.data)
  revalidatePath('/dashboard')
}

const deleteWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
})

export async function deleteWorkoutAction(input: z.infer<typeof deleteWorkoutSchema>) {
  const parsed = deleteWorkoutSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  await deleteWorkout(parsed.data.workoutId)
  revalidatePath('/dashboard')
}
```

### Calling Server Actions from Client Components

Import the action from the colocated `actions.ts` and pass it as a prop from a Server Component. Client Components call it directly with a typed object — not a form submission.

```typescript
// app/dashboard/page.tsx (Server Component)
import { createWorkoutAction } from './actions'
import { CreateWorkoutForm } from '@/components/create-workout-form'

export default async function DashboardPage() {
  return <CreateWorkoutForm onSubmit={createWorkoutAction} />
}
```

```typescript
// components/create-workout-form.tsx (Client Component)
'use client'

import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(255),
  workoutDate: z.date(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']),
})

type Props = {
  onSubmit: (input: z.infer<typeof schema>) => Promise<void>
}

export function CreateWorkoutForm({ onSubmit }: Props) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await onSubmit({
      name: 'Morning Session',
      workoutDate: new Date(),
      status: 'completed',
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name='name' />
      <button type='submit'>Create</button>
    </form>
  )
}
```

**Rules:**
- ✅ Server Action params are typed plain objects — never `FormData`
- ✅ Zod `safeParse` is the first thing called in every Server Action
- ✅ Server Actions call `/data` helpers
- ✅ Server Actions call `revalidatePath` or `revalidateTag` after mutations
- ✅ Server Actions are passed to Client Components as props from a Server Component
- ❌ Server Actions do NOT contain `db.*` calls directly
- ❌ Client Components do NOT import from `/data` directly

---

## Drizzle Insert/Update/Delete Reference

| Operation | Drizzle syntax |
|-----------|---------------|
| Insert one | `db.insert(table).values({ ... }).returning()` |
| Insert many | `db.insert(table).values([{ ... }, { ... }]).returning()` |
| Update | `db.update(table).set({ ... }).where(eq(table.id, id)).returning()` |
| Delete | `db.delete(table).where(eq(table.id, id))` |
| Upsert | `db.insert(table).values({ ... }).onConflictDoUpdate({ target: table.id, set: { ... } })` |

Always use `.returning()` on insert and update so the caller receives the persisted record.

---

## Input Types

Use Drizzle's inferred insert types from the schema as a base, then omit server-managed fields:

```typescript
import type { InsertWorkout } from '@/app/db/schema'

// Strip fields the server always controls
type CreateWorkoutInput = Omit<InsertWorkout, 'userId' | 'id' | 'createdAt' | 'updatedAt'>
```

When importing these types, always use `import type`:

```typescript
// ✅ CORRECT
import type { InsertWorkout } from '@/app/db/schema'

// ❌ WRONG
import { InsertWorkout } from '@/app/db/schema'
```

---

## Anti-Patterns to Avoid

### ❌ Drizzle calls outside `/data`
```typescript
// app/workouts/actions.ts — DON'T DO THIS
'use server'
import { db } from '@/app/index'
import { workoutsTable } from '@/app/db/schema'

export async function createWorkoutAction() {
  await db.insert(workoutsTable).values({ ... }) // Move this to /data/workouts.ts
}
```

### ❌ Server Action defined inside a component file
```typescript
// app/dashboard/page.tsx — DON'T DO THIS
async function createWorkoutAction() {
  'use server'
  await createWorkout({ ... }) // Should be in app/dashboard/actions.ts
}
```

### ❌ Client Component importing from `/data` directly
```typescript
'use client'
// DON'T DO THIS
import { createWorkout } from '@/data/workouts' // Server-only, not callable from client
```

### ❌ Missing ownership check on update/delete
```typescript
// DON'T DO THIS
export async function deleteWorkout(workoutId: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  // No ownership check — any authenticated user can delete any workout!
  await db.delete(workoutsTable).where(eq(workoutsTable.id, workoutId))
}
```

### ❌ Accepting userId from the caller
```typescript
// DON'T DO THIS
export async function createWorkout(userId: string, data: CreateWorkoutInput) {
  await db.insert(workoutsTable).values({ ...data, userId })
}
```

### ❌ Using `FormData` as a Server Action parameter
```typescript
// DON'T DO THIS
export async function createWorkoutAction(formData: FormData) {
  const name = formData.get('name') as string // Untyped, unvalidated
  await createWorkout({ name })
}
```

### ❌ Missing Zod validation in a Server Action
```typescript
// DON'T DO THIS
export async function createWorkoutAction(input: { name: string }) {
  // No validation — input is trusted blindly
  await createWorkout(input)
  revalidatePath('/dashboard')
}
```

### ❌ Missing cache revalidation after mutation
```typescript
// app/workouts/actions.ts — DON'T DO THIS
'use server'
export async function createWorkoutAction() {
  await createWorkout({ ... })
  // Forgot revalidatePath — UI will show stale data
}
```

---

## Summary

1. **Server Actions in `actions.ts`** — all mutations are triggered via Server Actions in colocated `actions.ts` files
2. **Typed params, no `FormData`** — Server Action params are always typed plain objects or primitives
3. **Zod validation first** — `safeParse` is called before any other logic in every Server Action
4. **Data layer only** — all `db.insert/update/delete` calls live in `/data/<entity>.ts`
5. **Drizzle ORM** — no raw SQL
6. **Auth first** — every data helper calls `auth()` and throws if `userId` is missing
7. **Ownership check** — updates and deletes verify the record belongs to the current user
8. **No userId input** — always read it from `auth()`, never accept it as a parameter
9. **Server Actions call helpers** — they never contain Drizzle logic directly
10. **Revalidate after writes** — always call `revalidatePath` or `revalidateTag` in the Server Action
