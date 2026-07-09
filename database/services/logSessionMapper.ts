import { ExerciseProgressLog, ExerciseProgressLogDetails } from '@/store/types'

export const getPersistableSets = (details: ExerciseProgressLogDetails[]) => {
    return details
        .filter((detail) => detail.isCompleted || detail.reps > 0 || detail.weight > 0)
        .map(({ set, reps, weight }) => ({ set, reps, weight }))
}

export const getBestAchieved = (exercise: ExerciseProgressLog) => {
    const persistableSets = getPersistableSets(exercise.details)
    if (persistableSets.length === 0) return undefined

    return Math.max(...persistableSets.map((set) => Math.max(set.weight * set.reps, set.reps)))
}
