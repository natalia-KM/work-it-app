import { useQuery } from '@tanstack/react-query'
import { useLogService } from '@/database/services/useLogService'

export const completedWorkoutSessionQueryKey = (workoutLogId?: number) => [
    'completed-workout-session',
    workoutLogId
]

export const useGetCompletedWorkoutSession = (workoutLogId?: number) => {
    const { getCompletedWorkoutSession } = useLogService()

    return useQuery({
        queryKey: completedWorkoutSessionQueryKey(workoutLogId),
        queryFn: () => {
            if (!workoutLogId) return undefined

            return getCompletedWorkoutSession(workoutLogId)
        },
        enabled: typeof workoutLogId === 'number' && Number.isFinite(workoutLogId),
        retry: false
    })
}
