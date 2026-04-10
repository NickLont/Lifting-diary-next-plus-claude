import { auth } from '@clerk/nextjs/server'
import { db } from '@/app/index'
import { exercisesTable } from '@/app/db/schema'
import { or, isNull, eq } from 'drizzle-orm'

export const getExercises = async () => {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  return db.query.exercisesTable.findMany({
    where: or(
      isNull(exercisesTable.userId),
      eq(exercisesTable.userId, userId)
    ),
    columns: {
      id: true,
      name: true,
      category: true,
      muscleGroup: true,
      equipment: true,
    },
    orderBy: (t, { asc }) => [asc(t.name)],
  })
}

export type ExerciseOption = Awaited<ReturnType<typeof getExercises>>[number]
