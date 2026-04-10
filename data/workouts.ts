import { auth } from '@clerk/nextjs/server'
import { db } from '@/app/index'
import { workoutsTable, workoutExercisesTable, setsTable } from '@/app/db/schema'
import type { InsertWorkout, InsertWorkoutExercise, InsertSet } from '@/app/db/schema'
import { and, eq, gte, lt, desc, asc } from 'drizzle-orm'
import { getStartOfDay, getEndOfDay } from '@/lib/date-utils'

/**
 * Fetch all workouts for the currently logged-in user on a specific date
 * Includes all related exercises and sets in a single query to avoid N+1 problems
 *
 * @param date - The date to fetch workouts for
 * @returns Array of workouts with all relations (exercises and sets)
 */
export const getUserWorkoutsByDate = async (date: Date) => {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const startOfDayDate = getStartOfDay(date)
  const endOfDayDate = getEndOfDay(date)

  const workouts = await db.query.workoutsTable.findMany({
    where: and(
      eq(workoutsTable.userId, userId),
      gte(workoutsTable.workoutDate, startOfDayDate),
      lt(workoutsTable.workoutDate, endOfDayDate)
    ),
    with: {
      workoutExercises: {
        orderBy: asc(workoutExercisesTable.orderIndex),
        with: {
          exercise: true,
          sets: {
            orderBy: asc(setsTable.setNumber),
          },
        },
      },
    },
    orderBy: [desc(workoutsTable.startedAt)],
  })

  return workouts
}

/**
 * Type for workout with all relations (exercises and sets)
 */
export type WorkoutWithRelations = Awaited<ReturnType<typeof getUserWorkoutsByDate>>[number]

type CreateWorkoutInput = Omit<InsertWorkout, 'userId' | 'id' | 'createdAt' | 'updatedAt'>

export const createWorkout = async (input: CreateWorkoutInput) => {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const [workout] = await db
    .insert(workoutsTable)
    .values({ ...input, userId })
    .returning()

  return workout
}

export const getUserWorkoutDatesInRange = async (start: Date, end: Date): Promise<Date[]> => {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const rows = await db
    .select({ workoutDate: workoutsTable.workoutDate })
    .from(workoutsTable)
    .where(and(eq(workoutsTable.userId, userId), gte(workoutsTable.workoutDate, start), lt(workoutsTable.workoutDate, end)))

  // Deduplicate to one Date per calendar day
  const seen = new Map<string, Date>()
  for (const row of rows) {
    const key = row.workoutDate.toISOString().slice(0, 10)
    if (!seen.has(key)) seen.set(key, row.workoutDate)
  }
  return Array.from(seen.values())
}

type CreateSetInput = Omit<InsertSet, 'id' | 'workoutExerciseId' | 'createdAt' | 'updatedAt'>

type CreateWorkoutExerciseInput = Omit<InsertWorkoutExercise, 'id' | 'workoutId' | 'createdAt' | 'updatedAt'> & {
  sets: CreateSetInput[]
}

export type CreateWorkoutWithExercisesInput = CreateWorkoutInput & {
  exercises: CreateWorkoutExerciseInput[]
}

export const createWorkoutWithExercises = async (input: CreateWorkoutWithExercisesInput) => {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  return db.transaction(async (tx) => {
    const [workout] = await tx
      .insert(workoutsTable)
      .values({ userId, name: input.name, workoutDate: input.workoutDate, status: input.status, startedAt: input.startedAt ?? undefined, completedAt: input.completedAt ?? undefined })
      .returning()

    for (const exercise of input.exercises) {
      const [workoutExercise] = await tx
        .insert(workoutExercisesTable)
        .values({
          workoutId: workout.id,
          exerciseId: exercise.exerciseId,
          orderIndex: exercise.orderIndex,
          targetSets: exercise.targetSets,
          targetReps: exercise.targetReps,
          targetWeight: exercise.targetWeight,
          restTime: exercise.restTime,
          notes: exercise.notes,
        })
        .returning()

      if (exercise.sets.length > 0) {
        await tx.insert(setsTable).values(
          exercise.sets.map((set) => ({ ...set, workoutExerciseId: workoutExercise.id }))
        )
      }
    }

    return workout
  })
}
