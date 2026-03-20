import { CalendarX } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'

interface EmptyStateProps {
  date: Date
}

export function EmptyState ({ date }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
      <CalendarX className='h-12 w-12 text-muted-foreground mb-4' />
      <h3 className='text-lg font-semibold mb-2'>No workouts logged</h3>
      <p className='text-muted-foreground'>
        No workouts found for {formatDate(date)}
      </p>
    </div>
  )
}
