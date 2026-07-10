import { useQuery } from '@tanstack/react-query'
import { useLogService } from '@/database/services/useLogService'

export const completedWorkoutHistoryQueryKey = ['completed-workout-history']

export const useGetCompletedWorkoutHistory = () => {
    const { getCompletedWorkoutHistory } = useLogService()

    return useQuery({
        queryKey: completedWorkoutHistoryQueryKey,
        queryFn: getCompletedWorkoutHistory,
        retry: false
    })
}
