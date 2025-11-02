import { useWorkoutService } from '@/database/services/useWorkoutService'
import { useQuery } from '@tanstack/react-query'

export const useGetWorkouts = () => {
    const { getWorkouts } = useWorkoutService()

    return useQuery({
        queryKey: ['workouts'],
        queryFn: getWorkouts
    })
}