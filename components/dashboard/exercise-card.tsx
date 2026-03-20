import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ExerciseSet {
  id: number
  reps: number
  weight: number | null
  completed: boolean
}

interface Exercise {
  id: number
  name: string
  sets: ExerciseSet[]
}

interface ExerciseCardProps {
  exercise: Exercise
}

export function ExerciseCard ({ exercise }: ExerciseCardProps) {
  const completedSets = exercise.sets.filter(set => set.completed).length
  const totalSets = exercise.sets.length

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <CardTitle className='text-lg'>{exercise.name}</CardTitle>
          <Badge variant='secondary'>
            {completedSets}/{totalSets} sets
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {exercise.sets.map((set, index) => (
            <div
              key={set.id}
              className='flex items-center justify-between text-sm border-l-2 pl-3 py-1'
              style={{
                borderColor: set.completed ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                opacity: set.completed ? 1 : 0.6
              }}
            >
              <span className='font-medium'>Set {index + 1}</span>
              <div className='flex gap-4'>
                <span>
                  <span className='text-muted-foreground'>Reps:</span>{' '}
                  <span className='font-semibold'>{set.reps}</span>
                </span>
                {set.weight && (
                  <span>
                    <span className='text-muted-foreground'>Weight:</span>{' '}
                    <span className='font-semibold'>{set.weight} kg</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
