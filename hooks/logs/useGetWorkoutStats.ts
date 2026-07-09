import { useQuery } from '@tanstack/react-query'
import { useLogService } from '@/database/services/useLogService'

export const useGetWorkoutStats = () => {
    const { getWorkoutStats } = useLogService()

    return useQuery({
        queryKey: ['workout-stats'],
        queryFn: getWorkoutStats
    })
}

