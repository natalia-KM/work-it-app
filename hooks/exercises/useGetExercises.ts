import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Exercise } from '@/database/entities'
import { useExercisesService } from '@/database/services/useExerciseService'

export const useGetExercises = (): UseQueryResult<Exercise[], Error> => {
    const { getExercises } = useExercisesService()

    return useQuery<Exercise[], Error>({
        queryKey: ['exercises'],
        queryFn: () => getExercises()
    });
};
