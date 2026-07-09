import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useExercisesService } from '@/database/services/useExerciseService'
import { deleteStoredImage } from '@/components/utils/saveImage'

export const useDeleteExercise = () => {
    const { deleteExercise } = useExercisesService()
    const queryClient = useQueryClient()

    const deleteExerciseData = async (exerciseId: number) => {
        return deleteExercise(exerciseId)
    }

    return useMutation({
        mutationKey: ['deleteExercise'],
        mutationFn: deleteExerciseData,
        onSuccess: async (deletedPhoto, exerciseId) => {
            deleteStoredImage(deletedPhoto)

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['exercise', exerciseId] }),
                queryClient.invalidateQueries({ queryKey: ['exercises'] }),
                queryClient.invalidateQueries({ queryKey: ['exercises-with-tabs'] })
            ])
        }
    })
}
