'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Plus, Trash2, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { CreateWorkoutInput } from '@/app/dashboard/workout/new/actions'
import type { ExerciseOption } from '@/data/exercises'

// ─── Types ───────────────────────────────────────────────────────────────────

type SetDraft = {
  setNumber: number
  reps: string
  weight: string
  duration: string
  distance: string
  rpe: string
  isWarmup: boolean
  isDropSet: boolean
  isFailure: boolean
  completed: boolean
  notes: string
}

type ExerciseDraft = {
  exerciseId: number
  orderIndex: number
  targetSets: string
  targetReps: string
  targetWeight: string
  restTime: string
  notes: string
  sets: SetDraft[]
  expanded: boolean
}

type Props = {
  exercises: ExerciseOption[]
  onSubmit: (input: CreateWorkoutInput) => Promise<void>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ALL_CATEGORIES = '__all__'

const emptySet = (setNumber: number): SetDraft => ({
  setNumber,
  reps: '',
  weight: '',
  duration: '',
  distance: '',
  rpe: '',
  isWarmup: false,
  isDropSet: false,
  isFailure: false,
  completed: true,
  notes: '',
})

const parseOptionalInt = (v: string) => v.trim() !== '' ? parseInt(v, 10) : undefined
const parseOptionalStr = (v: string) => v.trim() !== '' ? v.trim() : undefined

// ─── Sub-components ───────────────────────────────────────────────────────────

const SetRow = ({
  set,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  set: SetDraft
  index: number
  onChange: (updated: SetDraft) => void
  onRemove: () => void
  canRemove: boolean
}) => {
  const update = (field: keyof SetDraft, value: SetDraft[keyof SetDraft]) =>
    onChange({ ...set, [field]: value })

  return (
    <div className='border rounded-md p-3 space-y-3 bg-muted/30'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium'>Set {set.setNumber}</span>
        {canRemove && (
          <Button type='button' variant='ghost' size='icon' className='h-6 w-6' onClick={onRemove}>
            <Trash2 className='h-3 w-3' />
          </Button>
        )}
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <div className='space-y-1'>
          <Label className='text-xs'>Reps <span className='text-muted-foreground font-normal'>(optional)</span></Label>
          <Input
            type='number'
            min='1'
            placeholder='e.g. 8'
            value={set.reps}
            onChange={(e) => update('reps', e.target.value)}
            className='h-8 text-sm'
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs'>Weight (kg) <span className='text-muted-foreground font-normal'>(optional)</span></Label>
          <Input
            type='number'
            min='0'
            step='0.5'
            placeholder='e.g. 80'
            value={set.weight}
            onChange={(e) => update('weight', e.target.value)}
            className='h-8 text-sm'
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs'>Duration (s) <span className='text-muted-foreground font-normal'>(optional)</span></Label>
          <Input
            type='number'
            min='1'
            placeholder='e.g. 60'
            value={set.duration}
            onChange={(e) => update('duration', e.target.value)}
            className='h-8 text-sm'
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs'>Distance (m) <span className='text-muted-foreground font-normal'>(optional)</span></Label>
          <Input
            type='number'
            min='0'
            step='0.01'
            placeholder='e.g. 1000'
            value={set.distance}
            onChange={(e) => update('distance', e.target.value)}
            className='h-8 text-sm'
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs'>RPE (1–10) <span className='text-muted-foreground font-normal'>(optional)</span></Label>
          <Input
            type='number'
            min='1'
            max='10'
            placeholder='e.g. 8'
            value={set.rpe}
            onChange={(e) => update('rpe', e.target.value)}
            className='h-8 text-sm'
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs'>Notes <span className='text-muted-foreground font-normal'>(optional)</span></Label>
          <Input
            placeholder='e.g. felt strong'
            value={set.notes}
            onChange={(e) => update('notes', e.target.value)}
            className='h-8 text-sm'
          />
        </div>
      </div>

      <div className='flex flex-wrap gap-4'>
        {(
          [
            { field: 'isWarmup', label: 'Warm-up' },
            { field: 'isDropSet', label: 'Drop set' },
            { field: 'isFailure', label: 'To failure' },
          ] as { field: 'isWarmup' | 'isDropSet' | 'isFailure', label: string }[]
        ).map(({ field, label }) => (
          <div key={field} className='flex items-center gap-1.5'>
            <Checkbox
              id={`set-${index}-${field}`}
              checked={set[field]}
              onCheckedChange={(v) => update(field, v === true)}
            />
            <Label htmlFor={`set-${index}-${field}`} className='text-xs font-normal cursor-pointer'>
              {label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

const ExerciseBlock = ({
  draft,
  exercises,
  categoryFilter,
  onChange,
  onRemove,
}: {
  draft: ExerciseDraft
  exercises: ExerciseOption[]
  categoryFilter: string
  onChange: (updated: ExerciseDraft) => void
  onRemove: () => void
}) => {
  const [comboOpen, setComboOpen] = useState(false)

  const filtered = exercises.filter((e) =>
    categoryFilter === ALL_CATEGORIES || e.category === categoryFilter
  )

  const selected = exercises.find(e => e.id === draft.exerciseId)

  const update = <K extends keyof ExerciseDraft>(field: K, value: ExerciseDraft[K]) =>
    onChange({ ...draft, [field]: value })

  const addSet = () => {
    onChange({ ...draft, sets: [...draft.sets, emptySet(draft.sets.length + 1)] })
  }

  const removeSet = (i: number) => {
    const sets = draft.sets.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, setNumber: idx + 1 }))
    onChange({ ...draft, sets })
  }

  const updateSet = (i: number, updated: SetDraft) => {
    const sets = draft.sets.map((s, idx) => idx === i ? updated : s)
    onChange({ ...draft, sets })
  }

  return (
    <div className='border rounded-lg p-4 space-y-4'>
      <div className='flex items-center justify-between'>
        <span className='font-medium text-sm'>
          {selected ? selected.name : 'Select an exercise'}
        </span>
        <div className='flex gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={() => update('expanded', !draft.expanded)}
          >
            {draft.expanded ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
          </Button>
          <Button type='button' variant='ghost' size='icon' className='h-7 w-7' onClick={onRemove}>
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {draft.expanded && (
        <div className='space-y-4'>
          {/* Exercise picker */}
          <div className='space-y-1.5'>
            <Label className='text-xs'>Exercise <span className='text-destructive'>*</span></Label>
            <Popover open={comboOpen} onOpenChange={setComboOpen}>
              <PopoverTrigger
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full h-8 text-sm justify-between font-normal')}
                aria-expanded={comboOpen}
              >
                {selected
                  ? (
                    <span>
                      {selected.name}
                      {(selected.muscleGroup || selected.category) && (
                        <span className='text-muted-foreground ml-1 text-xs'>
                          ({[selected.muscleGroup, selected.category].filter(Boolean).join(' · ')})
                        </span>
                      )}
                    </span>
                    )
                  : <span className='text-muted-foreground'>Search exercises…</span>}
                <ChevronsUpDown className='ml-2 h-3 w-3 shrink-0 opacity-50' />
              </PopoverTrigger>
              <PopoverContent className='w-[--radix-popover-trigger-width] p-0' align='start'>
                <Command>
                  <CommandInput placeholder='Search by name, muscle group or category…' />
                  <CommandList>
                    <CommandEmpty>No exercises found.</CommandEmpty>
                    <CommandGroup>
                      {filtered.map(e => (
                        <CommandItem
                          key={e.id}
                          value={[e.name, e.muscleGroup, e.category].filter(Boolean).join(' ')}
                          onSelect={() => {
                            update('exerciseId', e.id)
                            setComboOpen(false)
                          }}
                        >
                          <span className='flex-1'>{e.name}</span>
                          {(e.muscleGroup || e.category) && (
                            <span className='text-muted-foreground text-xs'>
                              {[e.muscleGroup, e.category].filter(Boolean).join(' · ')}
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Exercise-level targets */}
          <div className='grid grid-cols-2 gap-2'>
            <div className='space-y-1'>
              <Label className='text-xs'>Target sets <span className='text-muted-foreground font-normal'>(optional)</span></Label>
              <Input
                type='number'
                min='1'
                placeholder='e.g. 3'
                value={draft.targetSets}
                onChange={(e) => update('targetSets', e.target.value)}
                className='h-8 text-sm'
              />
            </div>
            <div className='space-y-1'>
              <Label className='text-xs'>Target reps <span className='text-muted-foreground font-normal'>(optional)</span></Label>
              <Input
                type='number'
                min='1'
                placeholder='e.g. 8'
                value={draft.targetReps}
                onChange={(e) => update('targetReps', e.target.value)}
                className='h-8 text-sm'
              />
            </div>
            <div className='space-y-1'>
              <Label className='text-xs'>Target weight (kg) <span className='text-muted-foreground font-normal'>(optional)</span></Label>
              <Input
                type='number'
                min='0'
                step='0.5'
                placeholder='e.g. 80'
                value={draft.targetWeight}
                onChange={(e) => update('targetWeight', e.target.value)}
                className='h-8 text-sm'
              />
            </div>
            <div className='space-y-1'>
              <Label className='text-xs'>Rest time (s) <span className='text-muted-foreground font-normal'>(optional)</span></Label>
              <Input
                type='number'
                min='0'
                placeholder='e.g. 90'
                value={draft.restTime}
                onChange={(e) => update('restTime', e.target.value)}
                className='h-8 text-sm'
              />
            </div>
          </div>
          <div className='space-y-1'>
            <Label className='text-xs'>Exercise notes <span className='text-muted-foreground font-normal'>(optional)</span></Label>
            <Input
              placeholder='Optional'
              value={draft.notes}
              onChange={(e) => update('notes', e.target.value)}
              className='h-8 text-sm'
            />
          </div>

          {/* Sets */}
          <div className='space-y-2'>
            <span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Sets</span>
            {draft.sets.map((set, i) => (
              <SetRow
                key={i}
                set={set}
                index={i}
                onChange={(updated) => updateSet(i, updated)}
                onRemove={() => removeSet(i)}
                canRemove={draft.sets.length > 1}
              />
            ))}
            <Button type='button' variant='outline' size='sm' onClick={addSet} className='w-full'>
              <Plus className='h-3 w-3 mr-1' /> Add set
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export const CreateWorkoutForm = ({ exercises, onSubmit }: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [workoutDate, setWorkoutDate] = useState<Date>(new Date())
  const [status, setStatus] = useState<CreateWorkoutInput['status']>('planned')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES)
  const [exerciseDrafts, setExerciseDrafts] = useState<ExerciseDraft[]>([])
  const [error, setError] = useState<string | null>(null)

  const categories = Array.from(new Set(exercises.map(e => e.category).filter(Boolean))) as string[]

  const addExercise = () => {
    setExerciseDrafts(prev => [
      ...prev,
      {
        exerciseId: 0,
        orderIndex: prev.length,
        targetSets: '',
        targetReps: '',
        targetWeight: '',
        restTime: '',
        notes: '',
        sets: [emptySet(1)],
        expanded: true,
      },
    ])
  }

  const removeExercise = (i: number) => {
    setExerciseDrafts(prev =>
      prev.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, orderIndex: idx }))
    )
  }

  const updateExercise = (i: number, updated: ExerciseDraft) => {
    setExerciseDrafts(prev => prev.map((d, idx) => idx === i ? updated : d))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const invalidExercise = exerciseDrafts.find(d => !d.exerciseId)
    if (exerciseDrafts.length > 0 && invalidExercise) {
      setError('Please select an exercise for each entry.')
      return
    }

    startTransition(async () => {
      try {
        await onSubmit({
          name,
          workoutDate,
          status,
          exercises: exerciseDrafts.map(d => ({
            exerciseId: d.exerciseId,
            orderIndex: d.orderIndex,
            targetSets: parseOptionalInt(d.targetSets),
            targetReps: parseOptionalInt(d.targetReps),
            targetWeight: parseOptionalStr(d.targetWeight),
            restTime: parseOptionalInt(d.restTime),
            notes: parseOptionalStr(d.notes),
            sets: d.sets.map(s => ({
              setNumber: s.setNumber,
              reps: parseOptionalInt(s.reps),
              weight: parseOptionalStr(s.weight),
              duration: parseOptionalInt(s.duration),
              distance: parseOptionalStr(s.distance),
              rpe: parseOptionalInt(s.rpe),
              isWarmup: s.isWarmup,
              isDropSet: s.isDropSet,
              isFailure: s.isFailure,
              completed: s.completed,
              notes: parseOptionalStr(s.notes),
            })),
          })),
        })
        router.push('/dashboard')
      } catch {
        setError('Failed to create workout. Please try again.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Workout fields */}
      <div className='space-y-4'>
        <div className='space-y-1.5'>
          <Label htmlFor='name'>Name <span className='text-destructive'>*</span></Label>
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
          <Label>Date <span className='text-destructive'>*</span></Label>
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
          <Label>Status <span className='text-destructive'>*</span></Label>
          <Select value={status} onValueChange={(v) => setStatus(v as CreateWorkoutInput['status'])}>
            <SelectTrigger disabled={isPending} className='w-full'>
              <SelectValue placeholder='Select status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='planned'>Planned</SelectItem>
              <SelectItem value='in_progress'>In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Exercises */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='font-medium'>Exercises</span>
          {categories.length > 0 && (
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? ALL_CATEGORIES)}>
              <SelectTrigger className='w-36 h-8 text-sm'>
                <SelectValue placeholder='All categories' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {exerciseDrafts.map((draft, i) => (
          <ExerciseBlock
            key={i}
            draft={draft}
            exercises={exercises}
            categoryFilter={categoryFilter}
            onChange={(updated) => updateExercise(i, updated)}
            onRemove={() => removeExercise(i)}
          />
        ))}

        <Button
          type='button'
          variant='outline'
          className='w-full'
          disabled={isPending}
          onClick={addExercise}
        >
          <Plus className='h-4 w-4 mr-2' /> Add exercise
        </Button>
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
