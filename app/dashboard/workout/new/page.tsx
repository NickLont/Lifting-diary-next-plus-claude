import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateWorkoutForm } from '@/components/dashboard/create-workout-form'
import { createWorkoutAction } from './actions'

export const metadata = { title: 'New Workout - Lifting Diary' }

const NewWorkoutPage = async () => {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className='container mx-auto px-4 py-8 max-w-lg'>
      <Card>
        <CardHeader>
          <CardTitle>New Workout</CardTitle>
          <CardDescription>Log a new workout session</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateWorkoutForm onSubmit={createWorkoutAction} />
        </CardContent>
      </Card>
    </div>
  )
}

export default NewWorkoutPage
