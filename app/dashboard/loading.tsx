import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const DashboardLoading = () => {
  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <header className='mb-8'>
        <Skeleton className='h-9 w-32 mb-4' />
        <Skeleton className='h-10 w-64' />
      </header>

      <div className='mb-6 flex gap-6'>
        <Skeleton className='h-8 w-24' />
        <Skeleton className='h-8 w-24' />
        <Skeleton className='h-8 w-24' />
      </div>

      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='space-y-2'>
                  <Skeleton className='h-6 w-48' />
                  <Skeleton className='h-4 w-24' />
                </div>
                <Skeleton className='h-6 w-20' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='flex gap-4 mb-4'>
                <Skeleton className='h-5 w-24' />
                <Skeleton className='h-5 w-20' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default DashboardLoading
