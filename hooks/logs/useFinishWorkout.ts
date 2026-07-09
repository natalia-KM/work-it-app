import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLogService } from '@/database/services/useLogService'
import { WorkoutProgressSession } from '@/store/types'

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
                queryClient.invalidateQueries({ queryKey: ['recentExerciseLogs', session.workoutId] })
            ])
        }
    })
}
