import { useMutation } from '@tanstack/react-query'
import { useExercisesService } from '@/database/services/useExerciseService'

export const useDeleteExercise = () => {
    const { deleteExercise } = useExercisesService()

    const deleteExerciseData = async (exerciseId: number) => {
        await deleteExercise(exerciseId)
    }

    return useMutation({
        mutationKey: ['deleteExercise'],
        mutationFn: deleteExerciseData
    })
}