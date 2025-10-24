import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ExerciseTab } from '@/database/entities'
import { useExercisesService } from '@/database/services/useExerciseService'

export const useGetExercisesWithTabs = (): UseQueryResult<ExerciseTab[], Error> => {
    const { getExercisesWithTabs } = useExercisesService()

    return useQuery<ExerciseTab[], Error>({
        queryKey: ['exercises'],
        queryFn: () => getExercisesWithTabs()
    });
};
