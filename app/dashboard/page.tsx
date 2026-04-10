import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DateSelector } from '@/components/dashboard/date-selector'
import { WorkoutList } from '@/components/dashboard/workout-list'
import { ErrorState } from '@/components/dashboard/error-state'
import { getUserWorkoutsByDate, getUserWorkoutDatesInRange } from '@/data/workouts'
import { parseDate, getTodayString, getStartOfMonth, getEndOfMonth } from '@/lib/date-utils'

interface PageProps {
  searchParams: Promise<{ date?: string }>
}

export const metadata = {
  title: 'Dashboard - Lifting Diary',
}

const DashboardPage = async ({ searchParams }: PageProps) => {
  // Check authentication (defensive layer)
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  // Get date from search params or default to today
  const params = await searchParams
  const dateString = params.date || getTodayString()
  const selectedDate = parseDate(dateString)

  // Fetch workouts with error handling
  let workouts
  let workoutDates: Date[] = []
  try {
    const results = await Promise.all([
      getUserWorkoutsByDate(selectedDate),
      getUserWorkoutDatesInRange(getStartOfMonth(selectedDate), getEndOfMonth(selectedDate)),
    ])
    workouts = results[0]
    workoutDates = results[1]
  } catch (error) {
    console.error('Failed to fetch workouts:', error)
    return (
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        <header className='mb-8'>
          <h1 className='text-3xl font-bold mb-4'>Dashboard</h1>
          <DateSelector currentDate={selectedDate} workoutDates={[]} />
        </header>
        <ErrorState message='Failed to load workouts. Please try again.' />
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold mb-4'>Dashboard</h1>
        <DateSelector currentDate={selectedDate} workoutDates={workoutDates} />
      </header>

      <WorkoutList workouts={workouts} date={selectedDate} />
    </div>
  )
}

export default DashboardPage
