import { useEffect } from 'react'
import { useWorkoutProgressStore } from '@/store'
import { useSaveActiveWorkoutDraft } from '@/hooks/workouts/useActiveWorkoutDraft'

export const usePersistActiveWorkoutDraft = () => {
    const {
        workoutId,
        workoutTitle,
        startedAt,
        exerciseData,
        currentExerciseId,
        currentExerciseDetails
    } = useWorkoutProgressStore()
    const { mutate } = useSaveActiveWorkoutDraft()

    useEffect(() => {
        if (!workoutId || !startedAt) return

        mutate({
            workoutId,
            workoutTitle,
            startedAt,
            exerciseData,
            currentExerciseId,
            currentExerciseDetails
        })
    }, [
        currentExerciseDetails,
        currentExerciseId,
        exerciseData,
        mutate,
        startedAt,
        workoutId,
        workoutTitle
    ])
}
