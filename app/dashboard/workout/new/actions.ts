'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createWorkoutWithExercises } from '@/data/workouts'

const setSchema = z.object({
  setNumber: z.number().int().positive(),
  reps: z.number().int().positive().optional(),
  weight: z.string().optional(),
  duration: z.number().int().positive().optional(),
  distance: z.string().optional(),
  rpe: z.number().int().min(1).max(10).optional(),
  isWarmup: z.boolean().default(false),
  isDropSet: z.boolean().default(false),
  isFailure: z.boolean().default(false),
  completed: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
})

const workoutExerciseSchema = z.object({
  exerciseId: z.number().int().positive(),
  orderIndex: z.number().int().min(0),
  targetSets: z.number().int().positive().optional(),
  targetReps: z.number().int().positive().optional(),
  targetWeight: z.string().optional(),
  restTime: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
  sets: z.array(setSchema).min(1),
})

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(255),
  workoutDate: z.date(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  exercises: z.array(workoutExerciseSchema),
})

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>

export const createWorkoutAction = async (input: CreateWorkoutInput) => {
  const parsed = createWorkoutSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  await createWorkoutWithExercises(parsed.data)
  revalidatePath('/dashboard')
}
