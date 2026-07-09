import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWorkoutService } from '@/database/services/useWorkoutService'

interface WorkoutExercises {
    workoutId: number
    exercises: number[]
}

export const useAddExercisesToWorkout = () => {
    const { addWorkoutExercises } = useWorkoutService()
    const queryClient = useQueryClient()

    const addExercises = async ({ workoutId, exercises }: WorkoutExercises) => {
        await addWorkoutExercises(workoutId, exercises)
    }

    return useMutation({
        mutationKey: ['addExercisesToWorkout'],
        mutationFn: addExercises,
        onSuccess: async (_result, { workoutId }) => {
            await queryClient.invalidateQueries({ queryKey: ['workout-exercises', workoutId] })
        }
    })
}
