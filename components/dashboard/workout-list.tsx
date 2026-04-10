import type { WorkoutWithRelations } from '@/data/workouts'
import { WorkoutCard } from './workout-card'
import { ExerciseCard } from './exercise-card'
import { EmptyState } from './empty-state'

interface WorkoutListProps {
  workouts: WorkoutWithRelations[]
  date: Date
}

export const WorkoutList = ({ workouts, date }: WorkoutListProps) => {
  if (workouts.length === 0) {
    return <EmptyState date={date} />
  }

  const totalExercises = workouts.reduce(
    (sum, w) => sum + w.workoutExercises.length,
    0
  )
  const totalSets = workouts.reduce(
    (sum: number, w) => sum + w.workoutExercises.reduce((s: number, we) => s + we.sets.length, 0),
    0
  )

  return (
    <div>
      <div className='mb-6 flex gap-6 text-sm'>
        <div>
          <span className='font-semibold text-lg'>{workouts.length}</span>
          <span className='text-muted-foreground ml-2'>
            {workouts.length === 1 ? 'workout' : 'workouts'}
          </span>
        </div>
        <div>
          <span className='font-semibold text-lg'>{totalExercises}</span>
          <span className='text-muted-foreground ml-2'>
            {totalExercises === 1 ? 'exercise' : 'exercises'}
          </span>
        </div>
        <div>
          <span className='font-semibold text-lg'>{totalSets}</span>
          <span className='text-muted-foreground ml-2'>
            {totalSets === 1 ? 'set' : 'sets'}
          </span>
        </div>
      </div>

      <div className='space-y-6'>
        {workouts.map((workout) => (
          <div key={workout.id} className='space-y-3'>
            <WorkoutCard workout={workout} />
            {workout.workoutExercises.length > 0 && (
              <div className='ml-4 space-y-2'>
                {workout.workoutExercises.map((we) => (
                  <ExerciseCard
                    key={we.id}
                    exercise={{
                      id: we.exercise.id,
                      name: we.exercise.name,
                      sets: we.sets
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
