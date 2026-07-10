import { CompletedWorkoutSet } from '@/database/entities'
import { getSafeExerciseSets } from '@/database/logHistory'

export interface ExerciseHistorySourceRow {
    workoutLogId: number
    workoutId: number
    workoutTitle: string | null
    date: Date | null | number | string
    duration: number | null
    exerciseLogId: number
    details: unknown
    notes: string | null
    restTime: number | null
    bestAchieved: number | null
}

export interface ExerciseHistoryItem {
    workoutLogId: number
    workoutId: number
    workoutTitle: string
    date: Date | null
    duration: number | null
    exerciseLogId: number
    details: CompletedWorkoutSet[]
    notes: string | null
    restTime: number
    bestAchieved: number | null
    totalVolume: number
}

const asDate = (value: Date | null | number | string) => {
    if (!value) return null

    const date = value instanceof Date ? value : new Date(value)

    return Number.isNaN(date.getTime()) ? null : date
}

export const buildExerciseHistory = (
    rows: ExerciseHistorySourceRow[]
): ExerciseHistoryItem[] => rows.map((row) => {
    const details = getSafeExerciseSets(row.details)

    return {
        workoutLogId: row.workoutLogId,
        workoutId: row.workoutId,
        workoutTitle: row.workoutTitle ?? 'Workout',
        date: asDate(row.date),
        duration: row.duration,
        exerciseLogId: row.exerciseLogId,
        details,
        notes: row.notes,
        restTime: row.restTime ?? 0,
        bestAchieved: row.bestAchieved,
        totalVolume: details.reduce((sum, set) => sum + set.volume, 0)
    }
})
