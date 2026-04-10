import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EditWorkoutForm } from '@/components/dashboard/edit-workout-form'
import { getWorkoutById } from '@/data/workouts'
import { getExercises } from '@/data/exercises'

interface PageProps {
  params: Promise<{ workoutId: string }>
}

export const generateMetadata = async ({ params }: PageProps) => {
  const { workoutId } = await params
  return { title: `Edit Workout #${workoutId} - Lifting Diary` }
}

const WorkoutDetailPage = async ({ params }: PageProps) => {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { workoutId: workoutIdStr } = await params
  const workoutId = parseInt(workoutIdStr, 10)
  if (isNaN(workoutId) || workoutId <= 0) notFound()

  const [workout, exercises] = await Promise.all([
    getWorkoutById(workoutId),
    getExercises(),
  ])

  if (!workout) notFound()

  return (
    <div className='container mx-auto px-4 py-8 max-w-lg'>
      <Card>
        <CardHeader>
          <CardTitle>Edit Workout</CardTitle>
          <CardDescription>Update your workout details</CardDescription>
        </CardHeader>
        <CardContent>
          <EditWorkoutForm workout={workout} exercises={exercises} />
        </CardContent>
      </Card>
    </div>
  )
}

export default WorkoutDetailPage
