import { useExercisesService } from '@/database/services/useExerciseService'
import { useMutation } from '@tanstack/react-query'
import { AddExerciseFormValues } from '@/components/AddExerciseForm/AddExerciseValidationSchema'

export const useCreateExercise = () => {
    const { addExercise, addExerciseTagLinks } = useExercisesService()

    const createExercise = async (data: AddExerciseFormValues) => {
        const exerciseData = {
            title: data.title,
            photo: data.photo?.uri,
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