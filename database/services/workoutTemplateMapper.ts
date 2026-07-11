export interface WorkoutTemplateExerciseDraft {
    exerciseId: number
    isOptional: boolean
    targetSets?: string | number | null
    targetReps?: string | number | null
    targetWeight?: string | number | null
    notes?: string | null
}

export interface WorkoutTemplateExerciseUpdate {
    exerciseId: number
    isOptional: number
    sortOrder: number
    targetSets: number | null
    targetReps: number | null
    targetWeight: number | null
    notes: string | null
}

export const cleanTemplateText = (value?: string | null) => {
    const cleaned = value?.trim()
    return cleaned && cleaned.length > 0 ? cleaned : null
}

const toOptionalPositiveInteger = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') return null

    const parsed = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) return null

    return Math.round(parsed)
}

const toOptionalWeight = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') return null

    const parsed = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(parsed) || parsed < 0) return null

    return parsed
}

export const normalizeWorkoutTemplateExercises = (
    exercises: WorkoutTemplateExerciseDraft[]
): WorkoutTemplateExerciseUpdate[] => {
    return exercises.map((exercise, index) => ({
        exerciseId: exercise.exerciseId,
        isOptional: exercise.isOptional ? 1 : 0,
        sortOrder: index,
        targetSets: toOptionalPositiveInteger(exercise.targetSets),
        targetReps: toOptionalPositiveInteger(exercise.targetReps),
        targetWeight: toOptionalWeight(exercise.targetWeight),
        notes: cleanTemplateText(exercise.notes)
    }))
}
