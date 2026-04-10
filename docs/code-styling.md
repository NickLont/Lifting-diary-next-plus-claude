# Code Styling

## Function Declarations

**CRITICAL:** Always use **fat arrow (arrow function) notation** instead of the `function` keyword.

```typescript
// ✅ CORRECT
const myFunction = () => {
  // ...
}

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  // ...
}

export const getUserWorkouts = async (date: Date) => {
  // ...
}

// ❌ WRONG
function myFunction() {
  // ...
}

async function getUserWorkouts(date: Date) {
  // ...
}

export async function createWorkout(input: CreateWorkoutInput) {
  // ...
}
```

This applies to:
- Exported functions (data layer, server actions, utilities)
- React components (use arrow functions assigned to `const`)
- Event handlers and callbacks
- All other function definitions
