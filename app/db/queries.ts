import { db } from '@/app/index'
import { workoutsTable, workoutExercisesTable, setsTable } from '@/app/db/schema'
import { and, eq, gte, lt, desc, asc } from 'drizzle-orm'
import { getStartOfDay, getEndOfDay } from '@/lib/date-utils'

/**
 * Fetch all workouts for a user on a specific date, with all related data
 * Uses a single query with relations to avoid N+1 problems
 */
export async function getWorkoutsByDateAndUser (userId: string, date: Date) {
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
 * Type for workout with all relations
 */
export type WorkoutWithRelations = Awaited<ReturnType<typeof getWorkoutsByDateAndUser>>[number]
