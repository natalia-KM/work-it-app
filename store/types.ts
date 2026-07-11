import { ExerciseLogDetails } from '@/database/entities'

export interface ExerciseProgressLogDetails extends ExerciseLogDetails {
    isCompleted?: boolean
}

export interface ExerciseProgressLog {
    exerciseId: number
    details: ExerciseProgressLogDetails[]
    restTime: number
    notes?: string
    bestAchieved?: number
    completed?: boolean
    skipped?: boolean
    isOptional?: boolean
}

export interface WorkoutProgressSession {
    workoutId: number
    startedAt: Date
    exercises: ExerciseProgressLog[]
}

export interface ActiveWorkoutDraft {
    id: number
    workoutId: number
    workoutTitle?: string | null
    startedAt: Date
    exerciseData: ExerciseProgressLog[]
    currentExerciseId?: number | null
    currentExerciseDetails: ExerciseProgressLogDetails[]
    updatedAt: Date
}

export type SaveActiveWorkoutDraftInput = Omit<ActiveWorkoutDraft, 'id' | 'updatedAt'>
