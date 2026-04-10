import { auth } from '@clerk/nextjs/server'
import { db } from '@/app/index'
import { workoutsTable, workoutExercisesTable, setsTable } from '@/app/db/schema'
import type { InsertWorkout } from '@/app/db/schema'
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
