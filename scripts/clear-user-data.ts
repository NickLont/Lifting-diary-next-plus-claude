/**
 * Script to clear all data for a specific user
 * Usage: npm run db:clear-user -- USER_ID
 */

import 'dotenv/config'
import { db } from '@/app/index'
import { exercisesTable, workoutsTable, workoutExercisesTable, setsTable } from '@/app/db/schema'
import { eq, inArray } from 'drizzle-orm'

async function clearUserData (userId: string) {
  try {
    console.log(`🗑️  Clearing all data for user: ${userId}`)

    // Find all workouts for this user
    const userWorkouts = await db
      .select({ id: workoutsTable.id })
      .from(workoutsTable)
      .where(eq(workoutsTable.userId, userId))

    if (userWorkouts.length === 0) {
      console.log('No workouts found for this user')
      return
    }

    const workoutIds = userWorkouts.map(w => w.id)

    // Find all workout_exercises for these workouts
    const userWorkoutExercises = await db
      .select({ id: workoutExercisesTable.id })
      .from(workoutExercisesTable)
      .where(inArray(workoutExercisesTable.workoutId, workoutIds))

    const workoutExerciseIds = userWorkoutExercises.map(we => we.id)

    // Delete sets for these workout_exercises
    if (workoutExerciseIds.length > 0) {
      await db.delete(setsTable)
        .where(inArray(setsTable.workoutExerciseId, workoutExerciseIds))
      console.log('✅ Deleted sets for user\'s workout exercises')
    }

    // Delete workout_exercises for these workouts
    if (workoutIds.length > 0) {
      await db.delete(workoutExercisesTable)
        .where(inArray(workoutExercisesTable.workoutId, workoutIds))
      console.log('✅ Deleted workout exercises for user\'s workouts')
    }

    // Delete workouts for this user
    await db.delete(workoutsTable)
      .where(eq(workoutsTable.userId, userId))
    console.log(`✅ Deleted ${workoutIds.length} workouts`)

    // Delete custom exercises for this user
    await db.delete(exercisesTable)
      .where(eq(exercisesTable.userId, userId))
    console.log('✅ Deleted custom exercises')

    console.log(`✅ All data cleared for user: ${userId}`)
  } catch (error) {
    console.error('❌ Error clearing user data:', error)
    process.exit(1)
  }
}

const userId = process.argv[2]

if (!userId) {
  console.error('❌ Please provide a user ID')
  console.error('Usage: npm run db:clear-user -- USER_ID')
  process.exit(1)
}

clearUserData(userId)
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
