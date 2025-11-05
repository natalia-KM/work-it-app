import { useWorkoutService } from '@/database/services/useWorkoutService'
import { useQuery } from '@tanstack/react-query'

export const useGetWorkout = (workoutId: number) => {
    const { getWorkoutById } = useWorkoutService()

    return useQuery({
        queryKey: ['workout', workoutId],
        queryFn: () => getWorkoutById(workoutId)
    })
}