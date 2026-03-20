'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function DashboardError ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
        <AlertCircle className='h-16 w-16 text-destructive mb-4' />
        <h2 className='text-2xl font-bold mb-2'>Something went wrong!</h2>
        <p className='text-muted-foreground mb-6'>
          An unexpected error occurred while loading the dashboard.
        </p>
        <div className='flex gap-3'>
          <Button onClick={reset}>Try again</Button>
          <Button variant='outline' onClick={() => { window.location.href = '/' }}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
