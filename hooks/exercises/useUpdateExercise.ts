import { useExercisesService } from '@/database/services/useExerciseService'
import { AddExerciseFormValues } from '@/components/AddExerciseForm/AddExerciseValidationSchema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveImage } from '@/components/utils/saveImage'

interface UpdateExerciseParams {
    exerciseId: number,
    data: AddExerciseFormValues
}

export const useUpdateExercise = () => {
    const { updateExercise, updateTags } = useExercisesService()
    const queryClient = useQueryClient()

    const updateExerciseData = async ({ exerciseId, data }: UpdateExerciseParams) => {
        if (data.photo) {
            saveImage(data.photo)
        }

        const exerciseData = {
            id: exerciseId,
            title: data.title,
            photo: data.photo,
            isCustom: true
        }
        await updateExercise(exerciseData)

        if (data.muscleTags) {
            await updateTags(exerciseId, data.muscleTags)
        }
    }

    return useMutation({
        mutationKey: ['updateExercise'],
        mutationFn: updateExerciseData,
        onSuccess: async (_result, { exerciseId }) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['exercise', exerciseId] }),
                queryClient.invalidateQueries({ queryKey: ['exercises'] }),
                queryClient.invalidateQueries({ queryKey: ['exercises-with-tabs'] }),
                queryClient.invalidateQueries({ queryKey: ['workout-exercises'] })
            ])
        }
    })
}
