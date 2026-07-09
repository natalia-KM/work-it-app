import { useExercisesService } from '@/database/services/useExerciseService'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AddExerciseFormValues } from '@/components/AddExerciseForm/AddExerciseValidationSchema'
import { saveImage } from '@/components/utils/saveImage'

export const useCreateExercise = () => {
    const { addExercise, addExerciseTagLinks } = useExercisesService()
    const queryClient = useQueryClient()

    const createExercise = async (data: AddExerciseFormValues) => {
        const photo = data.photo ? saveImage(data.photo) : data.photo

        if (data.photo && !photo) throw new Error('Could not save exercise image.')

        const exerciseData = {
            title: data.title,
            photo,
            isCustom: true
        }

        const exerciseId = await addExercise(exerciseData)

        if (data.muscleTags) {
            await addExerciseTagLinks(exerciseId, data.muscleTags)
        }
    }

    return useMutation({
        mutationKey: ['createExercise'],
        mutationFn: createExercise,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['exercises'] }),
                queryClient.invalidateQueries({ queryKey: ['exercises-with-tabs'] })
            ])
        }
    })
}
