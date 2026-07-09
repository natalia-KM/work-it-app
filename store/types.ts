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
}

export interface WorkoutProgressSession {
    workoutId: number
    startedAt: Date
    exercises: ExerciseProgressLog[]
}
