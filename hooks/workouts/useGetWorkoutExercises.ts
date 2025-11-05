import { useQuery } from '@tanstack/react-query'
import { useWorkoutService } from '@/database/services/useWorkoutService'

export const useGetWorkoutExercises = (workoutId: number) => {
    const { getWorkoutExercisesWithDetails } = useWorkoutService()

    return useQuery({
        queryKey: ['workout-exercises'],
        queryFn: () => getWorkoutExercisesWithDetails(workoutId),
        refetchOnMount: 'always'
    })
}