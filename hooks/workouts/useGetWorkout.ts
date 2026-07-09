import { useWorkoutService } from '@/database/services/useWorkoutService'
import { useQuery } from '@tanstack/react-query'
import { Workout } from '@/database/entities'
import { ApiHookProps } from '@/hooks/types'

interface GetWorkoutProps {
    workoutId?: number
    onSuccess?: (workout?: Workout) => void
}

export const useGetWorkout = ({
    workoutId,
    onSuccess,
    ...options
}: ApiHookProps<GetWorkoutProps, Workout | undefined>) => {
    const { getWorkoutById } = useWorkoutService()

    const getWorkout = async () => {
        if (!workoutId) return

        const result = await getWorkoutById(workoutId)

        onSuccess?.(result)
        return result

    }

    return useQuery({
        queryKey: ['workout', workoutId],
        queryFn: getWorkout,
        ...options
    })
}