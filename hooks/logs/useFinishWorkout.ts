import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLogService } from '@/database/services/useLogService'
import { WorkoutProgressSession } from '@/store/types'
import { completedWorkoutHistoryQueryKey } from '@/hooks/logs/useGetCompletedWorkoutHistory'
import { completedWorkoutSessionQueryKey } from '@/hooks/logs/useGetCompletedWorkoutSession'

export const useFinishWorkout = () => {
    const { saveWorkoutSession } = useLogService()
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['finish-workout'],
        mutationFn: (session: WorkoutProgressSession) => saveWorkoutSession(session),
        onSuccess: async (_workoutLogId, session) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['workouts'] }),
                queryClient.invalidateQueries({ queryKey: ['workout', session.workoutId] }),
                queryClient.invalidateQueries({ queryKey: ['workout-exercises', session.workoutId] }),
                queryClient.invalidateQueries({ queryKey: ['recent-exercise-logs', session.workoutId] }),
                queryClient.invalidateQueries({ queryKey: ['workout-stats'] }),
                queryClient.invalidateQueries({ queryKey: completedWorkoutHistoryQueryKey }),
                queryClient.invalidateQueries({ queryKey: completedWorkoutSessionQueryKey(_workoutLogId) })
            ])
        }
    })
}
