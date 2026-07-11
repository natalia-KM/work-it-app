import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWorkoutService, UpdateWorkoutTemplateInput } from '@/database/services/useWorkoutService'

export const useUpdateWorkoutTemplate = () => {
    const { updateWorkoutTemplate } = useWorkoutService()
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['update-workout-template'],
        mutationFn: (data: UpdateWorkoutTemplateInput) => updateWorkoutTemplate(data),
        onSuccess: async (_result, { workoutId }) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['workouts'] }),
                queryClient.invalidateQueries({ queryKey: ['workout', workoutId] }),
                queryClient.invalidateQueries({ queryKey: ['workout-exercises', workoutId] })
            ])
        }
    })
}
