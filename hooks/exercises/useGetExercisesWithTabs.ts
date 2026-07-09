import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ExerciseDetails } from '@/database/entities'
import { useExercisesService } from '@/database/services/useExerciseService'

export const useGetExercisesWithTabs = (): UseQueryResult<ExerciseDetails[], Error> => {
    const { getExercisesWithTabs } = useExercisesService()

    return useQuery<ExerciseDetails[], Error>({
        queryKey: ['exercises-with-tabs'],
        queryFn: getExercisesWithTabs
    });
};
