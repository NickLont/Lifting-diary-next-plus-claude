'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createWorkout } from '@/data/workouts'

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(255),
  workoutDate: z.date(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']),
})

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>

export const createWorkoutAction = async (input: CreateWorkoutInput) => {
  const parsed = createWorkoutSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  await createWorkout(parsed.data)
  revalidatePath('/dashboard')
}
