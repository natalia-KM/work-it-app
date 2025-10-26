import { useExercisesService } from '@/database/services/useExerciseService'
import { useQuery } from '@tanstack/react-query'
import { ExerciseDetails } from '@/database/entities'

export const useGetExerciseById = (id: number) => {
    const { getExerciseById } = useExercisesService()

    return useQuery<ExerciseDetails | null, Error>({
        queryKey: ['exercise', id],
        queryFn: () => getExerciseById(id)
    });
}