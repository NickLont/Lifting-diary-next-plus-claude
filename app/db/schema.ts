import { pgTable, integer, varchar, text, timestamp, boolean, numeric, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ========================================
// Tables
// ========================================

export const exercisesTable = pgTable('exercises', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar('user_id', { length: 255 }), // Clerk userId for custom exercises, null for default
  name: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 100 }), // e.g., 'strength', 'cardio', 'flexibility'
  muscleGroup: varchar('muscle_group', { length: 100 }), // e.g., 'chest', 'legs', 'back'
  equipment: varchar({ length: 100 }), // e.g., 'barbell', 'dumbbell', 'bodyweight'
  description: text(),
  isCustom: boolean('is_custom').notNull().default(false), // true if user-created
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('exercises_user_id_idx').on(table.userId),
  index('exercises_category_idx').on(table.category),
])

export const workoutsTable = pgTable('workouts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar('user_id', { length: 255 }).notNull(), // Clerk userId
  name: varchar({ length: 255 }).notNull(), // e.g., "Morning Chest Day"
  workoutDate: timestamp('workout_date').notNull(), // When the workout occurred
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  status: varchar({ length: 50 }).notNull().default('completed'), // 'planned', 'in_progress', 'completed', 'cancelled'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('workouts_user_id_idx').on(table.userId),
  index('workouts_workout_date_idx').on(table.workoutDate),
  index('workouts_user_id_workout_date_idx').on(table.userId, table.workoutDate),
])

export const workoutExercisesTable = pgTable('workout_exercises', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutId: integer('workout_id').notNull().references(() => workoutsTable.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercisesTable.id, { onDelete: 'restrict' }),
  orderIndex: integer('order_index').notNull(), // 0-based order in workout
  targetSets: integer('target_sets'),
  targetReps: integer('target_reps'),
  targetWeight: numeric('target_weight', { precision: 10, scale: 2 }),
  restTime: integer('rest_time'), // Rest time between sets in seconds
  notes: text(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('workout_exercises_workout_id_idx').on(table.workoutId),
  index('workout_exercises_exercise_id_idx').on(table.exerciseId),
])

export const setsTable = pgTable('sets', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutExerciseId: integer('workout_exercise_id').notNull().references(() => workoutExercisesTable.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number').notNull(), // 1-based set number
  reps: integer(),
  weight: numeric({ precision: 10, scale: 2 }),
  duration: integer(), // Duration in seconds (time-based exercises)
  distance: numeric({ precision: 10, scale: 2 }), // Distance (cardio exercises)
  rpe: integer(), // Rate of Perceived Exertion (1-10)
  isWarmup: boolean('is_warmup').notNull().default(false),
  isDropSet: boolean('is_drop_set').notNull().default(false),
  isFailure: boolean('is_failure').notNull().default(false), // Went to failure?
  completed: boolean().notNull().default(true),
  notes: text(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('sets_workout_exercise_id_idx').on(table.workoutExerciseId),
])

// ========================================
// Relations
// ========================================

export const exercisesRelations = relations(exercisesTable, ({ many }) => ({
  workoutExercises: many(workoutExercisesTable),
}))

export const workoutsRelations = relations(workoutsTable, ({ many }) => ({
  workoutExercises: many(workoutExercisesTable),
}))

export const workoutExercisesRelations = relations(workoutExercisesTable, ({ one, many }) => ({
  workout: one(workoutsTable, {
    fields: [workoutExercisesTable.workoutId],
    references: [workoutsTable.id],
  }),
  exercise: one(exercisesTable, {
    fields: [workoutExercisesTable.exerciseId],
    references: [exercisesTable.id],
  }),
  sets: many(setsTable),
}))

export const setsRelations = relations(setsTable, ({ one }) => ({
  workoutExercise: one(workoutExercisesTable, {
    fields: [setsTable.workoutExerciseId],
    references: [workoutExercisesTable.id],
  }),
}))

// ========================================
// TypeScript Types
// ========================================

export type Exercise = typeof exercisesTable.$inferSelect
export type InsertExercise = typeof exercisesTable.$inferInsert

export type Workout = typeof workoutsTable.$inferSelect
export type InsertWorkout = typeof workoutsTable.$inferInsert

export type WorkoutExercise = typeof workoutExercisesTable.$inferSelect
export type InsertWorkoutExercise = typeof workoutExercisesTable.$inferInsert

export type Set = typeof setsTable.$inferSelect
export type InsertSet = typeof setsTable.$inferInsert
