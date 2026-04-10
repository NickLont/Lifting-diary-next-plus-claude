import 'dotenv/config'
import { db } from '@/app/index'
import { exercisesTable } from '@/app/db/schema'

const exercises = [
  // Strength — Chest
  { name: 'Bench Press', category: 'strength', muscleGroup: 'chest', equipment: 'barbell' },
  { name: 'Incline Dumbbell Press', category: 'strength', muscleGroup: 'chest', equipment: 'dumbbell' },
  { name: 'Push-Up', category: 'strength', muscleGroup: 'chest', equipment: 'bodyweight' },

  // Strength — Back
  { name: 'Deadlift', category: 'strength', muscleGroup: 'back', equipment: 'barbell' },
  { name: 'Pull-Up', category: 'strength', muscleGroup: 'back', equipment: 'bodyweight' },
  { name: 'Barbell Row', category: 'strength', muscleGroup: 'back', equipment: 'barbell' },
  { name: 'Lat Pulldown', category: 'strength', muscleGroup: 'back', equipment: 'cable' },

  // Strength — Legs
  { name: 'Squat', category: 'strength', muscleGroup: 'legs', equipment: 'barbell' },
  { name: 'Romanian Deadlift', category: 'strength', muscleGroup: 'legs', equipment: 'barbell' },
  { name: 'Leg Press', category: 'strength', muscleGroup: 'legs', equipment: 'machine' },
  { name: 'Lunges', category: 'strength', muscleGroup: 'legs', equipment: 'dumbbell' },
  { name: 'Calf Raise', category: 'strength', muscleGroup: 'legs', equipment: 'machine' },

  // Strength — Shoulders
  { name: 'Overhead Press', category: 'strength', muscleGroup: 'shoulders', equipment: 'barbell' },
  { name: 'Lateral Raise', category: 'strength', muscleGroup: 'shoulders', equipment: 'dumbbell' },

  // Strength — Arms
  { name: 'Barbell Curl', category: 'strength', muscleGroup: 'biceps', equipment: 'barbell' },
  { name: 'Tricep Pushdown', category: 'strength', muscleGroup: 'triceps', equipment: 'cable' },
  { name: 'Dips', category: 'strength', muscleGroup: 'triceps', equipment: 'bodyweight' },

  // Strength — Core
  { name: 'Plank', category: 'strength', muscleGroup: 'core', equipment: 'bodyweight' },
  { name: 'Cable Crunch', category: 'strength', muscleGroup: 'core', equipment: 'cable' },

  // Cardio
  { name: 'Running', category: 'cardio', muscleGroup: 'full body', equipment: 'bodyweight' },
  { name: 'Cycling', category: 'cardio', muscleGroup: 'legs', equipment: 'machine' },
  { name: 'Rowing', category: 'cardio', muscleGroup: 'full body', equipment: 'machine' },
  { name: 'Jump Rope', category: 'cardio', muscleGroup: 'full body', equipment: 'bodyweight' },

  // Flexibility
  { name: 'Hip Flexor Stretch', category: 'flexibility', muscleGroup: 'hips', equipment: 'bodyweight' },
  { name: 'Hamstring Stretch', category: 'flexibility', muscleGroup: 'legs', equipment: 'bodyweight' },
]

const seedExercises = async () => {
  console.log('Seeding default exercises...')

  await db.insert(exercisesTable).values(
    exercises.map(e => ({ ...e, isCustom: false, userId: null }))
  ).onConflictDoNothing()

  console.log(`✅ Seeded ${exercises.length} exercises`)
  process.exit(0)
}

seedExercises().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
