import Link from 'next/link'
import { CalendarX, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { formatDate } from '@/lib/date-utils'

interface EmptyStateProps {
  date: Date
}

export const EmptyState = ({ date }: EmptyStateProps) => {
  return (
    <Card className='border-dashed'>
      <CardContent className='flex flex-col items-center justify-center py-12 px-4 text-center'>
        <CalendarX className='h-12 w-12 text-muted-foreground mb-4' />
        <h3 className='text-lg font-semibold mb-2'>No workouts logged</h3>
        <p className='text-muted-foreground mb-6'>
          No workouts found for {formatDate(date)}
        </p>
        <Link href='/dashboard/workout/new' className={buttonVariants()}>
          <Plus className='h-4 w-4 mr-2' />
          Create workout
        </Link>
      </CardContent>
    </Card>
  )
}
