import { ImportExerciseLog } from '@/database/importTypes'
import { ExerciseLogDetails } from '@/database/entities'

export const getImportedLogSource = (workoutTitle: string, date: string) => {
    return `ai-import:${workoutTitle.trim().toLowerCase()}:${date}`
}

export const getLogBestAchieved = (log: ImportExerciseLog) => {
    return Math.round(Math.max(...log.sets.map((set) => Math.max(set.weight * set.reps, set.reps))))
}

export const getLogDetails = (log: ImportExerciseLog): ExerciseLogDetails[] => {
    return log.sets.map(({ set, weight, reps }) => ({ set, weight, reps }))
}

