/**
 * Script to clear ALL data from the database
 * WARNING: This will delete all workouts, exercises, and sets for ALL users
 * Use with caution!
 */

import 'dotenv/config'
import { db } from '@/app/index'
import { exercisesTable, workoutsTable, workoutExercisesTable, setsTable } from '@/app/db/schema'

async function clearAllData () {
  try {
    console.log('🗑️  Clearing all data from database...')

    // Delete in order to respect foreign key constraints
    // Sets depend on workout_exercises
    const deletedSets = await db.delete(setsTable)
    console.log('✅ Deleted all sets')

    // Workout exercises depend on workouts and exercises
    const deletedWorkoutExercises = await db.delete(workoutExercisesTable)
    console.log('✅ Deleted all workout exercises')

    // Delete workouts (no dependencies)
    const deletedWorkouts = await db.delete(workoutsTable)
    console.log('✅ Deleted all workouts')

    // Delete exercises (no dependencies after workout_exercises are deleted)
    const deletedExercises = await db.delete(exercisesTable)
    console.log('✅ Deleted all exercises')

    console.log('✅ All data cleared successfully!')
  } catch (error) {
    console.error('❌ Error clearing data:', error)
    process.exit(1)
  }
}

clearAllData()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
