import { z } from 'zod'

export const importSetSchema = z.object({
    set: z.number().int().positive(),
    weight: z.number().min(0),
    reps: z.number().int().min(0),
    notes: z.string().optional().nullable()
})

export const importExerciseLogSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sets: z.array(importSetSchema).min(1),
    notes: z.string().optional().nullable()
})

export const importExerciseSchema = z.object({
    title: z.string().min(1),
    instructions: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    isOptional: z.boolean().default(false),
    sortOrder: z.number().int().min(0),
    targetSets: z.number().int().positive().optional().nullable(),
    targetReps: z.number().int().positive().optional().nullable(),
    targetWeight: z.number().min(0).optional().nullable(),
    logs: z.array(importExerciseLogSchema).default([])
})

export const importWorkoutSchema = z.object({
    title: z.string().min(1),
    notes: z.string().optional().nullable(),
    exercises: z.array(importExerciseSchema).min(1)
})

export const workoutNotesImportSchema = z.object({
    sourceName: z.string().min(1),
    summary: z.string().optional().nullable(),
    warnings: z.array(z.string()).default([]),
    workouts: z.array(importWorkoutSchema).min(1)
})

export type WorkoutNotesImport = z.infer<typeof workoutNotesImportSchema>
export type ImportWorkout = z.infer<typeof importWorkoutSchema>
export type ImportExercise = z.infer<typeof importExerciseSchema>
export type ImportExerciseLog = z.infer<typeof importExerciseLogSchema>
export type ImportSet = z.infer<typeof importSetSchema>

