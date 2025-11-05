import { useWorkoutService } from '@/database/services/useWorkoutService'
import { useMutation } from '@tanstack/react-query'

interface DeleteWorkoutExercisesArgs {
    workoutId: number
    exercises: number[]
}

export const useDeleteWorkoutExercises = () => {
    const { removeWorkoutExercises } = useWorkoutService()

    const deleteWorkoutExercises = async ({ workoutId, exercises }: DeleteWorkoutExercisesArgs) => {
        await removeWorkoutExercises(workoutId, exercises)
    }

    return useMutation({
        mutationKey: ['delete-workout-exercises'],
        mutationFn: deleteWorkoutExercises
    })
}