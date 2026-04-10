'use server'

import { z } from 'zod'
import { getUserWorkoutDatesInRange } from '@/data/workouts'

const getWorkoutDatesSchema = z.object({
  start: z.date(),
  end: z.date(),
})

export const getWorkoutDatesAction = async (input: z.infer<typeof getWorkoutDatesSchema>): Promise<Date[]> => {
  const parsed = getWorkoutDatesSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')
  return getUserWorkoutDatesInRange(parsed.data.start, parsed.data.end)
}
