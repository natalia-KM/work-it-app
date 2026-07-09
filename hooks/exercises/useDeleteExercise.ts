import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useExercisesService } from '@/database/services/useExerciseService'

export const useDeleteExercise = () => {
    const { deleteExercise } = useExercisesService()
    const queryClient = useQueryClient()

    const deleteExerciseData = async (exerciseId: number) => {
        await deleteExercise(exerciseId)
    }

    return useMutation({
        mutationKey: ['deleteExercise'],
        mutationFn: deleteExerciseData,
        onSuccess: async (_result, exerciseId) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['exercise', exerciseId] }),
                queryClient.invalidateQueries({ queryKey: ['exercises'] }),
                queryClient.invalidateQueries({ queryKey: ['exercises-with-tabs'] })
            ])
        }
    })
}
