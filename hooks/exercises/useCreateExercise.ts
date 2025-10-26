import { useExercisesService } from '@/database/services/useExerciseService'
import { useMutation } from '@tanstack/react-query'
import { AddExerciseFormValues } from '@/components/AddExerciseForm/AddExerciseValidationSchema'
import { saveImage } from '@/components/utils/saveImage'

export const useCreateExercise = () => {
    const { addExercise, addExerciseTagLinks } = useExercisesService()

    const createExercise = async (data: AddExerciseFormValues) => {
        if (data.photo) {
            saveImage(data.photo)
        }
        const exerciseData = {
            title: data.title,
            photo: data.photo,
            isCustom: true
        }

        const exerciseId = await addExercise(exerciseData)

        if (data.muscleTags) {
            await addExerciseTagLinks(exerciseId, data.muscleTags)
        }
    }

    return useMutation({
        mutationKey: ['createExercise'],
        mutationFn: createExercise
    })
}