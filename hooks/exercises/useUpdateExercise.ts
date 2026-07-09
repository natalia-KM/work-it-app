import { useExercisesService } from '@/database/services/useExerciseService'
import { AddExerciseFormValues } from '@/components/AddExerciseForm/AddExerciseValidationSchema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteStoredImage, saveImage } from '@/components/utils/saveImage'

interface UpdateExerciseParams {
    exerciseId: number,
    data: AddExerciseFormValues
}

export const useUpdateExercise = () => {
    const { getExerciseById, updateExercise, updateTags } = useExercisesService()
    const queryClient = useQueryClient()

    const updateExerciseData = async ({ exerciseId, data }: UpdateExerciseParams) => {
        const existingExercise = await getExerciseById(exerciseId)
        const photo = data.photo ? saveImage(data.photo) : data.photo

        if (data.photo && !photo) throw new Error('Could not save exercise image.')

        if (existingExercise?.photo && existingExercise.photo !== photo) {
            deleteStoredImage(existingExercise.photo)
        }

        const exerciseData = {
            id: exerciseId,
            title: data.title,
            photo,
            isCustom: true,
            instructions: existingExercise?.instructions
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
