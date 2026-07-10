import {
    CompletedWorkoutExercise,
    CompletedWorkoutHistoryItem,
    CompletedWorkoutSession,
    CompletedWorkoutSet,
    ExerciseLogDetails
} from '@/database/entities'

export interface CompletedWorkoutHistorySourceRow {
    workoutLogId: number
    workoutId: number
    workoutTitle: string | null
    date: Date | null | number | string
    duration: number | null
    exerciseLogId: number | null
    exerciseId: number | null
    exerciseTitle: string | null
    details: unknown
    notes: string | null
    restTime: number | null
    bestAchieved: number | null
}

interface SessionAccumulator extends CompletedWorkoutHistoryItem {
    exerciseKeys: Set<number>
}

const asDate = (value: Date | null | number | string) => {
    if (!value) return null

    const date = value instanceof Date ? value : new Date(value)

    return Number.isNaN(date.getTime()) ? null : date
}

const parseDetails = (details: unknown): unknown => {
    if (typeof details !== 'string') return details

    try {
        return JSON.parse(details)
    } catch {
        return []
    }
}

export const getSafeExerciseSets = (details: unknown): CompletedWorkoutSet[] => {
    const parsedDetails = parseDetails(details)

    if (!Array.isArray(parsedDetails)) return []

    return parsedDetails.map((detail, index) => {
        const candidate = detail as Partial<ExerciseLogDetails>
        const set = typeof candidate.set === 'number' && Number.isFinite(candidate.set)
            ? candidate.set
            : index + 1
        const reps = typeof candidate.reps === 'number' && Number.isFinite(candidate.reps)
            ? candidate.reps
            : 0
        const weight = typeof candidate.weight === 'number' && Number.isFinite(candidate.weight)
            ? candidate.weight
            : 0

        return {
            set,
            reps,
            weight,
            volume: reps * weight
        }
    })
}

const getExerciseKey = (row: CompletedWorkoutHistorySourceRow) => {
    return row.exerciseLogId ?? row.exerciseId
}

export const buildCompletedWorkoutHistory = (
    rows: CompletedWorkoutHistorySourceRow[]
): CompletedWorkoutHistoryItem[] => {
    const sessions = new Map<number, SessionAccumulator>()

    rows.forEach((row) => {
        let session = sessions.get(row.workoutLogId)
        if (!session) {
            session = {
                workoutLogId: row.workoutLogId,
                workoutId: row.workoutId,
                workoutTitle: row.workoutTitle ?? 'Workout',
                date: asDate(row.date),
                duration: row.duration,
                exerciseCount: 0,
                setCount: 0,
                totalVolume: 0,
                exerciseKeys: new Set<number>()
            }
            sessions.set(row.workoutLogId, session)
        }

        const exerciseKey = getExerciseKey(row)
        if (typeof exerciseKey === 'number') {
            session.exerciseKeys.add(exerciseKey)
        }

        const sets = getSafeExerciseSets(row.details)
        session.setCount += sets.length
        session.totalVolume += sets.reduce((sum, set) => sum + set.volume, 0)
    })

    return [...sessions.values()]
        .map(({ exerciseKeys, ...session }) => ({
            ...session,
            exerciseCount: exerciseKeys.size
        }))
        .sort((a, b) => {
            const aTime = a.date?.getTime() ?? 0
            const bTime = b.date?.getTime() ?? 0

            return bTime - aTime || b.workoutLogId - a.workoutLogId
        })
}

export const buildCompletedWorkoutSession = (
    rows: CompletedWorkoutHistorySourceRow[]
): CompletedWorkoutSession | undefined => {
    const summary = buildCompletedWorkoutHistory(rows).at(0)

    if (!summary) return undefined

    const exercises: CompletedWorkoutExercise[] = rows
        .filter((row) => typeof row.exerciseLogId === 'number' && typeof row.exerciseId === 'number')
        .map((row) => {
            const details = getSafeExerciseSets(row.details)

            return {
                exerciseLogId: row.exerciseLogId!,
                exerciseId: row.exerciseId!,
                exerciseTitle: row.exerciseTitle ?? 'Exercise',
                details,
                notes: row.notes,
                restTime: row.restTime ?? 0,
                bestAchieved: row.bestAchieved,
                totalVolume: details.reduce((sum, set) => sum + set.volume, 0)
            }
        })

    return {
        ...summary,
        exercises
    }
}
