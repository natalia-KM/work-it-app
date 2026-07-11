import { describe, expect, it } from 'vitest'
import { getTableName } from 'drizzle-orm'
import {
    ActiveWorkoutDraftTable,
    ExerciseTable,
    WorkoutExerciseTable,
    WorkoutLogExerciseTable,
    WorkoutLogTable,
    WorkoutTable
} from '@/database/schema'

describe('database schema', () => {
    it('keeps the core table names stable for migrations', () => {
        expect(getTableName(ExerciseTable)).toBe('Exercise')
        expect(getTableName(WorkoutTable)).toBe('Workout')
        expect(getTableName(WorkoutExerciseTable)).toBe('Workout_Exercise')
        expect(getTableName(WorkoutLogTable)).toBe('WorkoutLog')
        expect(getTableName(WorkoutLogExerciseTable)).toBe('WorkoutLog_Exercise')
        expect(getTableName(ActiveWorkoutDraftTable)).toBe('ActiveWorkoutDraft')
    })

    it('includes imported-note metadata on exercise and workout templates', () => {
        expect(ExerciseTable.instructions).toBeDefined()
        expect(WorkoutExerciseTable.isOptional).toBeDefined()
        expect(WorkoutExerciseTable.sortOrder).toBeDefined()
        expect(WorkoutExerciseTable.targetSets).toBeDefined()
        expect(WorkoutExerciseTable.targetReps).toBeDefined()
        expect(WorkoutExerciseTable.targetWeight).toBeDefined()
    })

    it('tracks imported workout log source for idempotent imports', () => {
        expect(WorkoutLogTable.source).toBeDefined()
    })

    it('stores a single recoverable active workout draft', () => {
        expect(ActiveWorkoutDraftTable.id).toBeDefined()
        expect(ActiveWorkoutDraftTable.workoutId).toBeDefined()
        expect(ActiveWorkoutDraftTable.startedAt).toBeDefined()
        expect(ActiveWorkoutDraftTable.exerciseData).toBeDefined()
        expect(ActiveWorkoutDraftTable.currentExerciseDetails).toBeDefined()
        expect(ActiveWorkoutDraftTable.updatedAt).toBeDefined()
    })
})

