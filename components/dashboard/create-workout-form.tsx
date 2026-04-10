'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { CreateWorkoutInput } from '@/app/dashboard/workout/new/actions'

type Props = {
  onSubmit: (input: CreateWorkoutInput) => Promise<void>
}

export const CreateWorkoutForm = ({ onSubmit }: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [workoutDate, setWorkoutDate] = useState<Date>(new Date())
  const [status, setStatus] = useState<CreateWorkoutInput['status']>('completed')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        await onSubmit({ name, workoutDate, status })
        router.push('/dashboard')
      } catch {
        setError('Failed to create workout. Please try again.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-1.5'>
        <Label htmlFor='name'>Name</Label>
        <Input
          id='name'
          placeholder='e.g. Morning Chest Day'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isPending}
        />
      </div>

      <div className='space-y-1.5'>
        <Label>Date</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start text-left font-normal')}
            disabled={isPending}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {format(workoutDate, 'MMMM d, yyyy')}
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={workoutDate}
              onSelect={(date) => {
                if (date) {
                  setWorkoutDate(date)
                  setCalendarOpen(false)
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className='space-y-1.5'>
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as CreateWorkoutInput['status'])}>
          <SelectTrigger disabled={isPending} className='w-full'>
            <SelectValue placeholder='Select status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='completed'>Completed</SelectItem>
            <SelectItem value='planned'>Planned</SelectItem>
            <SelectItem value='in_progress'>In Progress</SelectItem>
            <SelectItem value='cancelled'>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className='text-sm text-destructive'>{error}</p>}

      <div className='flex gap-2 pt-2'>
        <Button
          type='button'
          variant='outline'
          className='flex-1'
          disabled={isPending}
          onClick={() => router.push('/dashboard')}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          className='flex-1'
          disabled={isPending || !name.trim()}
        >
          {isPending ? 'Creating...' : 'Create Workout'}
        </Button>
      </div>
    </form>
  )
}
