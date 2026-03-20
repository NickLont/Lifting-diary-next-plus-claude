# UI Code Standards

## Component Library

This project uses **shadcn/ui** exclusively for all UI components. The base-nova style is configured.

## Core Principle

**Absolutely NO custom components should be created, ONLY use shadcn UI components.**

## Adding New UI Components

When you need a new UI element:

1. **Check if shadcn/ui provides it**: https://ui.shadcn.com/docs/components
2. **Install the component**:
   ```bash
   npx shadcn@latest add [component-name]
   ```
3. **Use the component** directly in your code

### Available shadcn/ui Components

Already installed:
- Button
- Calendar
- Popover
- Card
- Badge
- Separator
- Skeleton

To add more, visit: https://ui.shadcn.com/docs/components

## Styling Guidelines

### Use Tailwind CSS Classes

All styling should be done with Tailwind CSS utility classes:

```tsx
// ✅ Good
<div className='flex items-center gap-4 p-6'>
  <Button variant='outline' size='lg'>Click me</Button>
</div>

// ❌ Bad - no custom CSS
<div style={{ display: 'flex' }}>
  <button className='my-custom-button'>Click me</button>
</div>
```

### Component Variants

Use shadcn/ui's built-in variants:

```tsx
// ✅ Good - using shadcn variants
<Button variant='default'>Primary</Button>
<Button variant='outline'>Secondary</Button>
<Button variant='ghost'>Tertiary</Button>
<Badge variant='default'>Active</Badge>
<Badge variant='destructive'>Error</Badge>

// ❌ Bad - custom styling
<Button className='bg-blue-500 hover:bg-blue-600'>Primary</Button>
```

### Composition Over Creation

Compose shadcn/ui components together instead of creating custom wrappers:

```tsx
// ✅ Good - composing shadcn components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content here</p>
  </CardContent>
</Card>

// ❌ Bad - creating custom wrapper
function MyCustomCard({ title, children }) {
  return (
    <div className='custom-card'>
      <h3>{title}</h3>
      {children}
    </div>
  )
}
```

## What NOT to Do

### ❌ DO NOT Create Custom UI Components

```tsx
// ❌ Bad
function CustomButton({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>
}

// ❌ Bad
function CustomCard({ title, content }) {
  return (
    <div className='border rounded p-4'>
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  )
}
```

### ❌ DO NOT Create Custom Styled Wrappers

```tsx
// ❌ Bad
function PrimaryButton({ children, ...props }) {
  return (
    <Button className='bg-primary text-white' {...props}>
      {children}
    </Button>
  )
}
```

### ❌ DO NOT Use Custom CSS/SCSS Files

All styling must be done with Tailwind classes. No component-specific CSS files.

## Acceptable Component Patterns

While custom UI components are forbidden, the following patterns are acceptable:

### 1. Business Logic Components

Components that contain business logic, data fetching, or application-specific behavior:

```tsx
// ✅ Good - business logic component using shadcn/ui
export function WorkoutList({ workouts, date }) {
  if (workouts.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>No workouts found</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {workouts.map((workout) => (
        <Card key={workout.id}>
          <CardHeader>
            <CardTitle>{workout.name}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
```

### 2. Page Components

Next.js page components in `app/` directory:

```tsx
// ✅ Good - page component
export default function DashboardPage() {
  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold'>Dashboard</h1>
      <Button>Add Workout</Button>
    </div>
  )
}
```

### 3. Layout Components

Components that define structure but use shadcn/ui for all UI:

```tsx
// ✅ Good - layout with shadcn/ui
export function DashboardLayout({ children }) {
  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold'>Dashboard</h1>
      </header>
      {children}
    </div>
  )
}
```

## Key Distinction

**The rule is about UI primitives, not application components:**

- ❌ NO custom buttons, cards, inputs, modals, dropdowns, etc.
- ✅ YES to components that use shadcn/ui to build features
- ✅ YES to pages, layouts, and business logic components

## When You Need Something Not in shadcn/ui

If you need a UI pattern that shadcn/ui doesn't provide:

1. **Check if it can be composed** from existing shadcn/ui components
2. **Look for a shadcn/ui component** that hasn't been installed yet
3. **Consider if the pattern is really needed** - often simpler is better
4. **If absolutely necessary**, discuss with the team before creating anything custom

## Examples

### ✅ Correct Usage

```tsx
// Using shadcn/ui directly
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function WorkoutCard({ workout }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{workout.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{workout.description}</p>
        <Button>View Details</Button>
      </CardContent>
    </Card>
  )
}
```

### ❌ Incorrect Usage

```tsx
// Creating custom UI component
function MyButton({ children, ...props }) {
  return (
    <button
      className='px-4 py-2 bg-blue-500 rounded hover:bg-blue-600'
      {...props}
    >
      {children}
    </button>
  )
}

// Should use: <Button> from shadcn/ui instead
```

## Summary

- **Use shadcn/ui components exclusively** for all UI elements
- **Style with Tailwind CSS** utility classes
- **Compose, don't create** - combine shadcn components instead of building custom ones
- **Business logic components are fine** as long as they use shadcn/ui for rendering
- **When in doubt**, use an existing shadcn/ui component
