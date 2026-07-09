import { useLogService } from '@/database/services/useLogService'
import { useQuery } from '@tanstack/react-query'
import { ExerciseLog } from '@/database/entities'
import { ApiHookProps } from '@/hooks/types'

interface GetRecentExerciseLogsProps {
    workoutId?: number
    exerciseId?: number,
    onSuccess?: (log: ExerciseLog[]) => void
}

export const useGetRecentExerciseLogs = ({
    workoutId,
    exerciseId,
    onSuccess,
    ...options
}: ApiHookProps<GetRecentExerciseLogsProps, ExerciseLog[] | undefined>) => {
    const { getRecentExerciseLogs } = useLogService()

    const getExerciseLogs = async () => {
        if (!workoutId || !exerciseId) return

        const result = await getRecentExerciseLogs(workoutId, exerciseId)

        onSuccess?.(result)
        return result
    }

    return useQuery({
        queryKey: ['recent-exercise-logs', workoutId, exerciseId],
        queryFn: getExerciseLogs,
        ...options
    })
}
