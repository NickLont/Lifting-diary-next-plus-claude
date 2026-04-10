'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { getTodayString } from '@/lib/date-utils'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  const router = useRouter()

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      router.refresh()
    }
  }

  const handleGoToToday = () => {
    router.push(`/dashboard?date=${getTodayString()}`)
  }

  return (
    <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
      <AlertCircle className='h-12 w-12 text-destructive mb-4' />
      <h3 className='text-lg font-semibold mb-2'>Something went wrong</h3>
      <p className='text-muted-foreground mb-6'>{message}</p>
      <div className='flex gap-3'>
        <Button onClick={handleRetry} variant='default'>
          Try Again
        </Button>
        <Button onClick={handleGoToToday} variant='outline'>
          Go to Today
        </Button>
      </div>
    </div>
  )
}
