import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WorkoutWithRelations } from '@/app/db/queries'
import { format } from 'date-fns'

interface WorkoutCardProps {
  workout: WorkoutWithRelations
}

function getStatusVariant (status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default'
    case 'in_progress':
      return 'secondary'
    case 'cancelled':
      return 'destructive'
    default:
      return 'outline'
  }
}

function formatWorkoutTime (startedAt: Date | null, completedAt: Date | null): string {
  if (completedAt) {
    return format(completedAt, 'h:mm a')
  }
  if (startedAt) {
    return format(startedAt, 'h:mm a')
  }
  return 'No time recorded'
}

export function WorkoutCard ({ workout }: WorkoutCardProps) {
  const totalSets = workout.workoutExercises.reduce(
    (sum: number, we) => sum + we.sets.length,
    0
  )

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='text-xl'>{workout.name}</CardTitle>
            <p className='text-sm text-muted-foreground mt-1'>
              {formatWorkoutTime(workout.startedAt, workout.completedAt)}
            </p>
          </div>
          <Badge variant={getStatusVariant(workout.status)}>
            {workout.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex gap-4 text-sm'>
          <div>
            <span className='font-semibold'>{workout.workoutExercises.length}</span>
            <span className='text-muted-foreground ml-1'>
              {workout.workoutExercises.length === 1 ? 'exercise' : 'exercises'}
            </span>
          </div>
          <div>
            <span className='font-semibold'>{totalSets}</span>
            <span className='text-muted-foreground ml-1'>
              {totalSets === 1 ? 'set' : 'sets'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
