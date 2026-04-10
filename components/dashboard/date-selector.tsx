'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useRouter } from 'next/navigation'
import { formatDate, getDateString, getStartOfMonth, getEndOfMonth } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { getWorkoutDatesAction } from '@/app/dashboard/actions'

interface DateSelectorProps {
  currentDate: Date
  workoutDates: Date[]
}

export const DateSelector = ({ currentDate, workoutDates: initialWorkoutDates }: DateSelectorProps) => {
  const [open, setOpen] = useState(false)
  const [workoutDates, setWorkoutDates] = useState<Date[]>(initialWorkoutDates)
  const router = useRouter()

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = getDateString(date)
      router.push(`/dashboard?date=${dateString}`)
      setOpen(false)
    }
  }

  const handleMonthChange = async (month: Date) => {
    const dates = await getWorkoutDatesAction({
      start: getStartOfMonth(month),
      end: getEndOfMonth(month),
    })
    setWorkoutDates(dates)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={cn(buttonVariants({ variant: 'outline' }), 'justify-start text-left font-normal')}>
        <CalendarIcon className='mr-2 h-4 w-4' />
        {formatDate(currentDate)}
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={currentDate}
          onSelect={handleDateSelect}
          onMonthChange={handleMonthChange}
          modifiers={{ hasWorkout: workoutDates }}
        />
      </PopoverContent>
    </Popover>
  )
}
