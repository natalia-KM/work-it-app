import { useExercisesService } from '@/database/services/useExerciseService'
import { AddExerciseFormValues } from '@/components/AddExerciseForm/AddExerciseValidationSchema'
import { useMutation } from '@tanstack/react-query'
import { saveImage } from '@/components/utils/saveImage'

interface UpdateExerciseParams {
    exerciseId: number,
    data: AddExerciseFormValues
}

export const useUpdateExercise = () => {
    const { updateExercise, updateTags } = useExercisesService()

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
        const updatedExerciseId = await updateExercise(exerciseData)

        if (data.muscleTags && updatedExerciseId) {
            await updateTags(updatedExerciseId, data.muscleTags)
        }
    }

    return useMutation({
        mutationKey: ['updateExercise'],
        mutationFn: updateExerciseData
    })
}